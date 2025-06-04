const Ubicacion = require('../models/clase_ubicacion');

const obtenerUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.getUbicaciones();
    res.json(ubicaciones);
  } catch (err) {
    console.error('Error en obtenerUbicaciones:', err);
    res.status(500).json({ error: 'Error al obtener ubicaciones' });
  }
};

const obtenerUnaUbicacion = async (req, res) => {
  try {
    const { cedula_persona } = req.params;
    const ubicacion = await Ubicacion.getUnaUbicacion(cedula_persona);
    if (!ubicacion) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    res.json(ubicacion);
  } catch (err) {
    console.error('Error en obtenerUnaUbicacion:', err);
    res.status(500).json({ error: 'Error al obtener la ubicación' });
  }
};

const crearUbicacion = async (req, res) => {
  try {
    const ubicacionData = req.body;
    const nuevaUbicacion = await Ubicacion.createUbicacion(ubicacionData);
    res.status(201).json(nuevaUbicacion);
  } catch (err) {
    console.error('Error en crearUbicacion:', err);
    res.status(500).json({ error: err.message });
  }
};

const actualizarUbicacion = async (req, res) => {
  try {
    const { cedula_persona } = req.params;
    const ubicacionData = req.body;
    const ubicacionActualizada = await Ubicacion.updateUbicacion(cedula_persona, ubicacionData);
    if (!ubicacionActualizada) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    res.json(ubicacionActualizada);
  } catch (err) {
    console.error('Error en actualizarUbicacion:', err);
    res.status(500).json({ error: err.message });
  }
};

const eliminarUbicacion = async (req, res) => {
  try {
    const { cedula_persona } = req.params;
    const ubicacionEliminada = await Ubicacion.deleteUbicacion(cedula_persona);
    if (!ubicacionEliminada) {
      return res.status(404).json({ message: 'Ubicación no encontrada' });
    }
    res.json({ message: 'Ubicación eliminada', ubicacion: ubicacionEliminada });
  } catch (err) {
    console.error('Error en eliminarUbicacion:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  obtenerUbicaciones,
  obtenerUnaUbicacion,
  crearUbicacion,
  actualizarUbicacion,
  eliminarUbicacion
};