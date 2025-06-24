// controllers/controlador_credito.js
const Credito = require('../models/clase_credito');

const getCreditos = async (req, res) => {
  try {
    const creditos = await Credito.getCreditos();
    res.json(creditos);
  } catch (err) {
    console.error('Error en getCreditos:', err);
    res.status(500).json({ error: 'Error al obtener créditos' });
  }
};

const crearCredito = async (req, res) => {
  const {
    cedula_credito,
    referencia,
    monto_euros,
    monto_bs,
    diez_euros,
    fecha_desde,
    fecha_hasta,
    estatus, // Añadido
  } = req.body;

  // Validar que estatus tenga un valor
  if (!estatus) {
    return res.status(400).json({ error: 'El campo estatus es obligatorio' });
  }

  try {
    const nuevoCredito = await Credito.crearCredito({
      cedula_credito,
      referencia,
      monto_euros,
      monto_bs,
      diez_euros,
      fecha_desde,
      fecha_hasta,
      estatus, // Pasar el valor
    });
    res.status(201).json(nuevoCredito);
  } catch (err) {
    console.error('Error al crear crédito:', err);
    res.status(500).json({ error: 'Error al crear crédito' });
  }
};

module.exports = {
  getCreditos,
  crearCredito,
};