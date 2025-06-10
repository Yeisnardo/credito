const requerimientoModel = require('../models/clase_requerimieto');

const getRequerimientos = async (req, res) => {
  try {
    const requerimientos = await requerimientoModel.getRequerimientos();
    res.json(requerimientos);
  } catch (err) {
    console.error('Error en getRequerimientos:', err);
    res.status(500).json({ error: 'Error al obtener requerimientos' });
  }
};

const getRequerimiento = async (req, res) => {
  try {
    const { cedula } = req.params;
    const requerimiento = await requerimientoModel.getUnaRequerimiento(cedula);
    if (!requerimiento) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json(requerimiento);
  } catch (err) {
    console.error('Error en getRequerimiento:', err);
    res.status(500).json({ error: 'Error al obtener el requerimiento' });
  }
};

const createRequerimiento = async (req, res) => {
  try {
    const requerimientoData = req.body;
    const nuevoRequerimiento = await requerimientoModel.createRequerimiento(requerimientoData);
    res.status(201).json(nuevoRequerimiento);
  } catch (err) {
    console.error('Error en createRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateRequerimiento = async (req, res) => {
  try {
    const { cedula } = req.params;
    const requerimientoData = req.body;
    const requerimientoActualizado = await requerimientoModel.updateRequerimiento(cedula, requerimientoData);
    if (!requerimientoActualizado) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json(requerimientoActualizado);
  } catch (err) {
    console.error('Error en updateRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteRequerimiento = async (req, res) => {
  try {
    const { cedula } = req.params;
    const requerimientoEliminado = await requerimientoModel.deleteRequerimiento(cedula);
    if (!requerimientoEliminado) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json({
      message: 'Requerimiento eliminado',
      requerimiento: requerimientoEliminado,
    });
  } catch (err) {
    console.error('Error en deleteRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRequerimientos,
  getRequerimiento,
  createRequerimiento,
  updateRequerimiento,
  deleteRequerimiento,
};