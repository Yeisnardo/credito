// controllers/controlador_aprobacion.js
const Aprobacion = require('../models/clase_aprobacion');

const getAprobaciones = async (req, res) => {
  try {
    const aprobaciones = await Aprobacion.getAprobaciones();
    res.json(aprobaciones);
  } catch (err) {
    console.error('Error en getAprobaciones:', err);
    res.status(500).json({ error: 'Error al obtener aprobaciones' });
  }
};

const getAprobacion = async (req, res) => {
  try {
    const { cedula } = req.params;
    const aprobacion = await Aprobacion.getAprobacionPorCedula(cedula);
    if (!aprobacion) {
      return res.status(404).json({ message: 'Aprobación no encontrada' });
    }
    res.json(aprobacion);
  } catch (err) {
    console.error('Error en getAprobacion:', err);
    res.status(500).json({ error: 'Error al obtener la aprobación' });
  }
};

module.exports = {
  getAprobaciones,
  getAprobacion,
};