const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Función para validar datos de la cuenta
const validarCuenta = (cuenta) => {
  const { cedula_emprendedor, cedula_titular, nombre_completo, numero_cuenta } = cuenta;
  if (!cedula_emprendedor || !cedula_titular || !nombre_completo || !numero_cuenta) {
    throw new Error('Campos obligatorios incompletos');
  }
};

// Obtener todas las cuentas
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM cuenta');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getCuentas:', err);
    res.status(500).json({ message: 'Error al obtener cuentas' });
  }
});

// Obtener cuenta por cédula del emprendedor
router.get('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      'SELECT * FROM cuenta WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getCuentaPorCedula:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});


// Crear una nueva cuenta
router.post('/', async (req, res) => {
  try {
    const cuentaData = req.body;
    validarCuenta(cuentaData);
    const { cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta } = cuentaData;

    const resultado = await query(
      `INSERT INTO cuenta (cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cedula_emprendedor, banco, cedula_titular, nombre_completo, numero_cuenta]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en crearCuenta:', err);
    res.status(500).json({ message: err.message });
  }
});

// Actualizar cuenta por cédula del emprendedor
router.put('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const cuentaData = req.body;
    
    console.log("Datos recibidos para actualizar:", cuentaData);
    
    validarCuenta(cuentaData);
    const { banco, cedula_titular, nombre_completo, numero_cuenta } = cuentaData;

    const resultado = await query(
      `UPDATE cuenta SET banco = $1, cedula_titular = $2, nombre_completo = $3, numero_cuenta = $4
       WHERE cedula_emprendedor = $5 RETURNING *`,
      [banco, cedula_titular, nombre_completo, numero_cuenta, cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }
    
    console.log("Cuenta actualizada:", resultado.rows[0]);
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en actualizarCuenta:', err);
    res.status(500).json({ message: err.message });
  }
});

// Eliminar cuenta por cédula del emprendedor
router.delete('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      'DELETE FROM cuenta WHERE cedula_emprendedor = $1 RETURNING *',
      [cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }
    res.json({ message: 'Cuenta eliminada', cuenta: resultado.rows[0] });
  } catch (err) {
    console.error('Error en eliminarCuenta:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;