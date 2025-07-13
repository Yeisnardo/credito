const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

// Obtener todos los fondos
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM fondo');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getFondos:', err);
    res.status(500).json({ error: 'Error al obtener fondos' });
  }
});

// Crear un nuevo fondo
router.post('/', async (req, res) => {
  try {
    const { monto } = req.body;
    const fecha = new Date().toISOString(); // Fecha actual en ISO
    const tipo_movimiento = 'Ingreso'; // por defecto
    const montoNum = parseFloat(monto);
    
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // Obtener saldo actual (si quieres, pero en este ejemplo solo sumamos)
    let saldoActual = 0; // Puedes ajustar esto con una consulta si quieres saldo real
    saldoActual += montoNum;

    const resultado = await query(
      `INSERT INTO fondo (fecha, tipo_movimiento, monto, saldo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [fecha, tipo_movimiento, montoNum, saldoActual]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createFondo:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
