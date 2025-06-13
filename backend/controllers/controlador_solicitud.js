const Solicitud = require('../models/clase_solicitud');

// Get all solicitudes
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getSolicitudes();
    res.json(solicitudes);
  } catch (err) {
    console.error('Error en getSolicitudes:', err);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

// Get solicitud by cedula
const getSolicitudPorCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    // Assumes Solicitud model has a method to get multiple solicitudes by cedula
    const solicitudes = await Solicitud.getSolicitudesPorCedula(cedula);
    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron solicitudes para la cédula proporcionada' });
    }
    res.json(solicitudes);
  } catch (err) {
    console.error('Error en getSolicitudesPorCedula:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

// Create a new solicitud
const createSolicitud = async (req, res) => {
  try {
    const solicitudData = req.body;
    const nuevaSolicitud = await Solicitud.createSolicitud(solicitudData);
    res.status(201).json(nuevaSolicitud);
  } catch (err) {
    console.error('Error en createSolicitud:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update an existing solicitud
const updateSolicitud = async (req, res) => {
  try {
    const { cedula_solicitud } = req.params;
    const solicitudData = req.body;
    const solicitudActualizada = await Solicitud.updateSolicitud(cedula_solicitud, solicitudData);
    if (!solicitudActualizada) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    res.json(solicitudActualizada);
  } catch (err) {
    console.error('Error en updateSolicitud:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a solicitud
const deleteSolicitud = async (req, res) => {
  try {
    const { cedula_solicitud } = req.params;
    const solicitudEliminada = await Solicitud.deleteSolicitud(cedula_solicitud);
    if (!solicitudEliminada) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    res.json({ message: 'Solicitud eliminada', solicitud: solicitudEliminada });
  } catch (err) {
    console.error('Error en deleteSolicitud:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSolicitudes,
  getSolicitudPorCedula,
  createSolicitud,
  updateSolicitud,
  deleteSolicitud,
};
