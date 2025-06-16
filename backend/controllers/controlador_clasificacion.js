const Clasificacion = require('../models/clase_clasificacion');

const getClasificaciones = async (req, res) => {
  try {
    const clasificaciones = await Clasificacion.getClasificaciones();
    res.json(clasificaciones);
  } catch (err) {
    console.error('Error en getClasificaciones:', err);
    res.status(500).json({ error: 'Error al obtener clasificaciones' });
  }
};

const createClasificacion = async (req, res) => {
  try {
    const clasificacionData = req.body;
    const nuevaClasificacion = await Clasificacion.createClasificacion(clasificacionData);
    res.status(201).json(nuevaClasificacion);
  } catch (err) {
    console.error('Error en createClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateClasificacion = async (req, res) => {
  try {
    const { id_clasificacion } = req.params;
    const clasificacionData = req.body;
    const clasificacionActualizada = await Clasificacion.updateClasificacion(id_clasificacion, clasificacionData);
    if (!clasificacionActualizada) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    res.json(clasificacionActualizada);
  } catch (err) {
    console.error('Error en updateClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getClasificaciones,
  createClasificacion,
  updateClasificacion,
};
