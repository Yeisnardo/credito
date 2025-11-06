const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos
const verificarEstatusUsuario = require('../middlewares/verificarEstatus'); // Middleware para verificar estatus

const router = express.Router();

const rolesValidos = ['Administrador', 'Emprendedor', 'Credito1', 'Credito2'];

// Función para validar datos del usuario

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const resultado = await query(`
      SELECT 
        u.cedula_usuario, 
        p.nombre_completo, 
        p.edad, 
        p.telefono, 
        p.email, 
        p.estado, 
        p.municipio, 
        p.direccion_actual, 
        p.tipo_persona,
        u.usuario, 
        u.clave, 
        u.rol, 
        u.estatus
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getUsuario:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por cédula
router.get('/:cedula_usuario', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const resultado = await query(`
      SELECT 
        u.cedula_usuario, 
        p.nombre_completo, 
        p.edad, 
        p.telefono, 
        p.email, 
        p.estado, 
        p.municipio, 
        p.direccion_actual, 
        p.tipo_persona,
        u.usuario, 
        u.clave, 
        u.rol, 
        u.estatus,
        e.tipo_sector,
        e.tipo_negocio,
        e.nombre_emprendimiento,
        e.consejo_nombre,
        e.comuna,
        e.direccion_emprendimiento
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
      LEFT JOIN emprendimientos e ON u.cedula_usuario = e.cedula_emprendedor
      WHERE u.cedula_usuario = $1`, [cedula_usuario]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getUsuarioPorCedula:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const usuarioData = req.body;
    const { cedula_usuario, usuario: nombreUsuario, clave, rol, estatus } = usuarioData;

    const resultado = await query(`
      INSERT INTO usuario (cedula_usuario, usuario, clave, rol, estatus)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, [cedula_usuario, nombreUsuario, clave, rol, estatus]);
    
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en createUsuario:', err);
    res.status(500).json({ message: err.message });
  }
});

// Actualizar un usuario existente
// Actualizar un usuario existente - VERSIÓN CORREGIDA
router.put('/:cedula_usuario', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const usuarioData = req.body;
    
    // Validar datos requeridos
    if (!usuarioData.usuario || !usuarioData.rol) {
      return res.status(400).json({ message: 'Usuario y rol son requeridos' });
    }

    // Construir la consulta dinámicamente para permitir actualizaciones parciales
    let queryParts = [];
    let queryParams = [];
    let paramCount = 1;

    if (usuarioData.usuario) {
      queryParts.push(`usuario = $${paramCount}`);
      queryParams.push(usuarioData.usuario);
      paramCount++;
    }

    if (usuarioData.clave) {
      queryParts.push(`clave = $${paramCount}`);
      queryParams.push(usuarioData.clave);
      paramCount++;
    }

    if (usuarioData.rol) {
      queryParts.push(`rol = $${paramCount}`);
      queryParams.push(usuarioData.rol);
      paramCount++;
    }

    if (usuarioData.estatus) {
      queryParts.push(`estatus = $${paramCount}`);
      queryParams.push(usuarioData.estatus);
      paramCount++;
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    queryParams.push(cedula_usuario);

    const queryString = `
      UPDATE usuario 
      SET ${queryParts.join(', ')} 
      WHERE cedula_usuario = $${paramCount} 
      RETURNING *
    `;

    const resultado = await query(queryString, queryParams);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateUsuario:', err);
    res.status(500).json({ message: err.message });
  }
});

// Verificar contraseña - RUTA CORREGIDA
router.post('/verify-password', async (req, res) => {
  try {
    const { cedula_usuario, password } = req.body;
    
    if (!cedula_usuario || !password) {
      return res.status(400).json({ valid: false, message: 'Datos incompletos' });
    }
    
    const resultado = await query(
      'SELECT clave FROM usuario WHERE cedula_usuario = $1',
      [cedula_usuario]
    );
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Usuario no encontrado' });
    }
    
    const user = resultado.rows[0];
    const isValid = user.clave === password;
    
    res.json({ valid: isValid });
  } catch (err) {
    console.error('Error verificando contraseña:', err);
    res.status(500).json({ valid: false, message: 'Error del servidor' });
  }
});

// Actualizar solo contraseña - RUTA CORREGIDA
router.put('/:cedula_usuario/password', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const { clave } = req.body;
    
    if (!clave || clave.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    const resultado = await query(
      'UPDATE usuario SET clave = $1 WHERE cedula_usuario = $2 RETURNING cedula_usuario, usuario, rol, estatus',
      [clave, cedula_usuario]
    );
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ 
      message: 'Contraseña actualizada correctamente',
      usuario: resultado.rows[0] 
    });
  } catch (err) {
    console.error('Error actualizando contraseña:', err);
    res.status(500).json({ message: err.message });
  }
});

// Eliminar un usuario por cédula
router.delete('/:cedula_usuario', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const resultado = await query('DELETE FROM usuario WHERE cedula_usuario = $1 RETURNING *', [cedula_usuario]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado', usuario: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deleteUsuario:', err);
    res.status(500).json({ message: err.message });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const resultado = await query('SELECT * FROM usuario WHERE usuario = $1', [usuario]);
    
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = resultado.rows[0];
    if (user.estatus && user.estatus.toLowerCase() === 'inactivo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    if (user.clave !== clave) {
      return res.status(401).json({ error: 'Credenciales Incorrectas' });
    }

    res.json({ message: 'Inicio de sesión exitoso', user });
  } catch (err) {
    console.error('Error en loginUsuario:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estatus de un usuario
router.put('/:cedula_usuario/estatus', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const { estatus } = req.body;
    const resultado = await query('UPDATE usuario SET estatus = $1 WHERE cedula_usuario = $2 RETURNING *', [estatus, cedula_usuario]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateEstatusUsuario:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  try {
    // En una implementación real con tokens, aquí invalidarías el token
    // Por ahora, simplemente respondemos con éxito
    res.json({ 
      success: true, 
      message: 'Sesión cerrada correctamente' 
    });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// Ruta protegida
router.get('/perfil', verificarEstatusUsuario, (req, res) => {
  res.json({ message: 'Acceso permitido', usuario: req.usuario });
});

module.exports = router;