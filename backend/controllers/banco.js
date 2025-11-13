const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Función para registrar en bitácora
const registrarBitacora = async (accion, cedula_usuario, detalles = {}) => {
  try {
    await query(
      `INSERT INTO bitacora (accion, cedula_usuario, detalles) 
       VALUES ($1, $2, $3)`,
      [accion, cedula_usuario, JSON.stringify(detalles)]
    );
  } catch (error) {
    console.error('Error al registrar en bitácora:', error);
  }
};

// Función para obtener cédula del usuario desde el token (debes adaptar según tu auth)
const obtenerUsuarioActual = (req) => {
  // Aquí debes implementar cómo obtienes el usuario actual
  // Esto es un ejemplo - adapta según tu sistema de autenticación
  return req.user?.cedula || req.headers['user-cedula'] || 'sistema';
};

// Función para validar datos de la cuenta
const validarCuenta = (cuenta) => {
  const { cedula_emprendedor, cedula_titular, nombre_completo, numero_cuenta } = cuenta;
  if (!cedula_emprendedor || !cedula_titular || !nombre_completo || !numero_cuenta) {
    throw new Error('Campos obligatorios incompletos');
  }
};

// Middleware para log de todas las operaciones
const logOperacion = (accion) => {
  return (req, res, next) => {
    console.log(`${accion} - ${req.method} ${req.originalUrl}`);
    next();
  };
};

// Obtener todas las cuentas
router.get('/', logOperacion('OBTENER_CUENTAS'), async (req, res) => {
  try {
    const resultado = await query('SELECT DISTINCT * FROM cuenta');
    
    // Registrar en bitácora
    await registrarBitacora(
      'CONSULTA_CUENTAS',
      obtenerUsuarioActual(req),
      { 
        total_cuentas: resultado.rows.length,
        filtros: req.query 
      }
    );

    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getCuentas:', err);
    
    // Registrar error en bitácora
    await registrarBitacora(
      'ERROR_CONSULTA_CUENTAS',
      obtenerUsuarioActual(req),
      { 
        error: err.message,
        stack: err.stack 
      }
    );

    res.status(500).json({ message: 'Error al obtener cuentas' });
  }
});

// Obtener cuenta por cédula del emprendedor
router.get('/:cedula_emprendedor', logOperacion('OBTENER_CUENTA'), async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      'SELECT * FROM cuenta WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      // Registrar consulta sin resultados
      await registrarBitacora(
        'CONSULTA_CUENTA_NO_ENCONTRADA',
        obtenerUsuarioActual(req),
        { cedula_emprendedor }
      );

      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    // Registrar consulta exitosa
    await registrarBitacora(
      'CONSULTA_CUENTA_EXITOSA',
      obtenerUsuarioActual(req),
      { 
        cedula_emprendedor,
        cuenta_encontrada: true 
      }
    );

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getCuentaPorCedula:', err);
    
    await registrarBitacora(
      'ERROR_CONSULTA_CUENTA',
      obtenerUsuarioActual(req),
      { 
        cedula_emprendedor: req.params.cedula_emprendedor,
        error: err.message 
      }
    );

    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Crear una nueva cuenta
router.post('/', logOperacion('CREAR_CUENTA'), async (req, res) => {
  let cliente;
  try {
    const cuentaData = req.body;
    validarCuenta(cuentaData);
    const { cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta } = cuentaData;

    // Verificar si ya existe una cuenta para este emprendedor
    const cuentaExistente = await query(
      'SELECT * FROM cuenta WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (cuentaExistente.rows.length > 0) {
      await registrarBitacora(
        'INTENTO_CREAR_CUENTA_EXISTENTE',
        obtenerUsuarioActual(req),
        { cedula_emprendedor }
      );

      return res.status(409).json({ 
        message: 'Ya existe una cuenta para este emprendedor' 
      });
    }

    const resultado = await query(
      `INSERT INTO cuenta (cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta]
    );

    const nuevaCuenta = resultado.rows[0];

    // Registrar creación exitosa en bitácora
    await registrarBitacora(
      'CREACION_CUENTA_EXITOSA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor,
        banco,
        cedula_titular,
        nombre_completo: nombre_completo.substring(0, 50), // Limitar longitud para bitácora
        numero_cuenta: numero_cuenta.substring(0, 4) + '***' // Ocultar parte del número
      }
    );

    res.status(201).json(nuevaCuenta);
  } catch (err) {
    console.error('Error en crearCuenta:', err);
    
    await registrarBitacora(
      'ERROR_CREACION_CUENTA',
      obtenerUsuarioActual(req),
      {
        datos_recibidos: {
          cedula_emprendedor: req.body.cedula_emprendedor,
          banco: req.body.banco,
          cedula_titular: req.body.cedula_titular,
          nombre_completo: req.body.nombre_completo?.substring(0, 30),
          numero_cuenta: req.body.numero_cuenta?.substring(0, 4) + '***'
        },
        error: err.message
      }
    );

    res.status(500).json({ message: err.message });
  }
});

// Actualizar cuenta por cédula del emprendedor
router.put('/:cedula_emprendedor', logOperacion('ACTUALIZAR_CUENTA'), async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const cuentaData = req.body;
    
    console.log("Datos recibidos para actualizar:", cuentaData);
    
    validarCuenta(cuentaData);
    const { banco, cedula_titular, nombre_completo, numero_cuenta } = cuentaData;

    // Obtener datos antiguos para la bitácora
    const cuentaAnterior = await query(
      'SELECT * FROM cuenta WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (cuentaAnterior.rows.length === 0) {
      await registrarBitacora(
        'INTENTO_ACTUALIZAR_CUENTA_NO_EXISTENTE',
        obtenerUsuarioActual(req),
        { cedula_emprendedor }
      );

      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const resultado = await query(
      `UPDATE cuenta SET banco = $1, cedula_titular = $2, nombre_completo = $3, numero_cuenta = $4
       WHERE cedula_emprendedor = $5 RETURNING *`,
      [banco, cedula_titular, nombre_completo, numero_cuenta, cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const cuentaActualizada = resultado.rows[0];
    
    // Registrar actualización en bitácora con cambios
    const cambios = {};
    const datosAnteriores = cuentaAnterior.rows[0];
    
    if (datosAnteriores.banco !== banco) cambios.banco = { anterior: datosAnteriores.banco, nuevo: banco };
    if (datosAnteriores.cedula_titular !== cedula_titular) cambios.cedula_titular = { anterior: datosAnteriores.cedula_titular, nuevo: cedula_titular };
    if (datosAnteriores.nombre_completo !== nombre_completo) cambios.nombre_completo = { anterior: datosAnteriores.nombre_completo, nuevo: nombre_completo.substring(0, 50) };
    if (datosAnteriores.numero_cuenta !== numero_cuenta) cambios.numero_cuenta = { anterior: datosAnteriores.numero_cuenta.substring(0, 4) + '***', nuevo: numero_cuenta.substring(0, 4) + '***' };

    await registrarBitacora(
      'ACTUALIZACION_CUENTA_EXITOSA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor,
        cambios,
        fecha_actualizacion: new Date().toISOString()
      }
    );

    console.log("Cuenta actualizada:", cuentaActualizada);
    res.json(cuentaActualizada);
  } catch (err) {
    console.error('Error en actualizarCuenta:', err);
    
    await registrarBitacora(
      'ERROR_ACTUALIZACION_CUENTA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor: req.params.cedula_emprendedor,
        datos_intento: {
          banco: req.body.banco,
          cedula_titular: req.body.cedula_titular,
          nombre_completo: req.body.nombre_completo?.substring(0, 30)
        },
        error: err.message
      }
    );

    res.status(500).json({ message: err.message });
  }
});

// Eliminar cuenta por cédula del emprendedor
router.delete('/:cedula_emprendedor', logOperacion('ELIMINAR_CUENTA'), async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    
    // Obtener datos antes de eliminar para la bitácora
    const cuentaAEliminar = await query(
      'SELECT * FROM cuenta WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (cuentaAEliminar.rows.length === 0) {
      await registrarBitacora(
        'INTENTO_ELIMINAR_CUENTA_NO_EXISTENTE',
        obtenerUsuarioActual(req),
        { cedula_emprendedor }
      );

      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const resultado = await query(
      'DELETE FROM cuenta WHERE cedula_emprendedor = $1 RETURNING *',
      [cedula_emprendedor]
    );

    // Registrar eliminación en bitácora
    const cuentaEliminada = cuentaAEliminar.rows[0];
    await registrarBitacora(
      'ELIMINACION_CUENTA_EXITOSA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor,
        datos_eliminados: {
          banco: cuentaEliminada.banco,
          cedula_titular: cuentaEliminada.cedula_titular,
          nombre_completo: cuentaEliminada.nombre_completo.substring(0, 50),
          numero_cuenta: cuentaEliminada.numero_cuenta.substring(0, 4) + '***'
        },
        fecha_eliminacion: new Date().toISOString()
      }
    );

    res.json({ 
      message: 'Cuenta eliminada', 
      cuenta: {
        ...resultado.rows[0],
        numero_cuenta: resultado.rows[0].numero_cuenta.substring(0, 4) + '***' // Ocultar en respuesta
      }
    });
  } catch (err) {
    console.error('Error en eliminarCuenta:', err);
    
    await registrarBitacora(
      'ERROR_ELIMINACION_CUENTA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor: req.params.cedula_emprendedor,
        error: err.message
      }
    );

    res.status(500).json({ message: err.message });
  }
});

// Endpoint adicional para obtener historial de una cuenta
router.get('/:cedula_emprendedor/bitacora', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    
    const resultado = await query(
      `SELECT * FROM bitacora 
       WHERE detalles->>'cedula_emprendedor' = $1 
       OR detalles->'cambios'->>'cedula_emprendedor' = $1
       ORDER BY fecha DESC`,
      [cedula_emprendedor]
    );

    await registrarBitacora(
      'CONSULTA_BITACORA_CUENTA',
      obtenerUsuarioActual(req),
      { cedula_emprendedor }
    );

    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en obtenerBitacoraCuenta:', err);
    res.status(500).json({ message: 'Error al obtener bitácora' });
  }
});

module.exports = router;