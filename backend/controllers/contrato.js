const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

let lastId = 0; // Variable para mantener el último ID utilizado

// Ruta para insertar en n_contrato
router.post('/', async (req, res) => {
  try {
    const { cedula_emprendedor, numero_contrato } = req.body;

    const resultado = await query(
      `INSERT INTO n_contrato (cedula_emprendedor, numero_contrato)
       VALUES ($1, $2)
       RETURNING *`,
      [cedula_emprendedor, numero_contrato]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al registrar en n_contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para insertar en la tabla 'contrato'
router.post('/contrato', async (req, res) => {
  try {
    let {
      numero_contrato,
      cedula_emprendedor,
      monto_aprob_euro,
      monto_bs,
      cincoflat,
      diezinteres,
      monto_devolver,
      fecha_desde,
      fecha_hasta,
      estatus
    } = req.body;

    // Validar fechas
    fecha_desde = fecha_desde && fecha_desde.trim() !== '' ? fecha_desde : null;
    fecha_hasta = fecha_hasta && fecha_hasta.trim() !== '' ? fecha_hasta : null;

    // Incrementar el ID
    lastId += 1;
    const id_contrato = lastId;

    const resultado = await query(
      `INSERT INTO contrato (
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        monto_aprob_euro,
        monto_bs,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        estatus
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        monto_aprob_euro,
        monto_bs,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        estatus
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al registrar en contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nueva ruta: Obtener contratos por cédula del emprendedor
router.get('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;

    const resultado = await query(
      `SELECT * FROM contrato WHERE cedula_emprendedor = $1`,
      [cedula]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
