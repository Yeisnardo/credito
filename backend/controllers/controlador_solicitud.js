const Solicitud = require('../models/clase_solicitud');

const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.getSolicitudes();
    res.json(solicitudes);
  } catch (err) {
    console.error('Error en getSolicitudes:', err);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

const getSolicitudPorCedula = async (req, res) => {
  try {
    const { cedula_solicitud } = req.params;
    const solicitud = await Solicitud.getSolicitudPorCedula(cedula_solicitud);
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    res.json(solicitud);
  } catch (err) {
    console.error('Error en getSolicitudPorCedula:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
};

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

const updateSolicitud = async (req, res) => {
  try {
    const { cedula_solicitud } = req.params;
    const solicitudData = req.body;
    const solicitudActualizada = await Solicitud.updateSolicitud(cedula_solicitud, solicitudData);
    res.json(solicitudActualizada);
  } catch (err) {
    console.error('Error en updateSolicitud:', err);
    res.status(500).json({ message: err.message });
  }
};

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