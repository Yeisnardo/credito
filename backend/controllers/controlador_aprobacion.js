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

module.exports = {
  getAprobaciones,
};