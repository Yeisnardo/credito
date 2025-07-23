const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos
const verificarEstatusUsuario = require('../middlewares/verificarEstatus'); // Middleware para verificar estatus

const router = express.Router();

// Validar los campos obligatorios de un usuario
const validarUsuario = (usuario) => {
  const { cedula_usuario, usuario: nombreUsuario, clave, rol, estatus } = usuario;
  if (!cedula_usuario || !nombreUsuario || !clave || !rol || !estatus) {
    throw new Error('Campos obligatorios incompletos');
  }
};

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
        u.estatus
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
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
    validarUsuario(usuarioData);
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
router.put('/:cedula_usuario', async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const usuarioData = req.body;
    validarUsuario(usuarioData);

    const resultado = await query(`
      UPDATE usuario SET
        usuario = $1,
        clave = $2,
        rol = $3,
        estatus = $4
      WHERE cedula_usuario = $5
      RETURNING *`, [usuarioData.usuario, usuarioData.clave, usuarioData.rol, usuarioData.estatus, cedula_usuario]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateUsuario:', err);
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

// Ruta protegida
router.get('/perfil', verificarEstatusUsuario, (req, res) => {
  res.json({ message: 'Acceso permitido', usuario: req.usuario });
});

module.exports = router;
