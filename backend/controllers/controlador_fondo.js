// controllers/controlador_fondo.js
const Fondo = require('../models/clase_fondo');

const getFondos = async (req, res) => {
  try {
    const fondos = await Fondo.getFondos();
    res.json(fondos);
  } catch (err) {
    console.error('Error en getFondos:', err);
    res.status(500).json({ error: 'Error al obtener fondos' });
  }
};

const createFondo = async (req, res) => {
  try {
    const { monto } = req.body;
    const fecha = new Date().toISOString(); // Fecha actual en ISO
    const tipo_movimiento = 'Ingreso'; // por defecto
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // Obtener saldo actual (si quieres, pero en este ejemplo solo sumamos)
    // Para este ejemplo, asumimos saldo inicial 0 y sumamos cada ingreso
    // Pero si quieres saldo acumulado, debes calcularlo en base a registros anteriores
    // Aquí, asumiremos que saldo será saldo actual + monto
    let saldoActual = 0; // Puedes ajustar esto con una consulta si quieres saldo real
    saldoActual += montoNum;

    const nuevoFondo = await Fondo.createFondo({
      fecha,
      tipo_movimiento,
      monto: montoNum,
      saldo: saldoActual,
    });

    res.status(201).json(nuevoFondo);
  } catch (error) {
    console.error('Error en createFondo:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFondos,
  createFondo,
};