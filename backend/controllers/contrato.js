const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

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
    console.error('Error al registrar contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;