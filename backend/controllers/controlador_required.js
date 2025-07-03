const RequerimientoEmprendedor = require('../models/clase_required');

const getRequerimientos = async (req, res) => {
  try {
    const requerimientos = await RequerimientoEmprendedor.getRequerimientos();
    res.json(requerimientos);
  } catch (err) {
    console.error('Error en getRequerimientos:', err);
    res.status(500).json({ error: 'Error al obtener requerimientos' });
  }
};

const getRequerimientoById = async (req, res) => {
  try {
    const { id_req } = req.params;
    const requerimiento = await RequerimientoEmprendedor.getRequerimientoById(id_req);
    if (!requerimiento) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json(requerimiento);
  } catch (err) {
    console.error('Error en getRequerimientoById:', err);
    res.status(500).json({ error: 'Error al obtener el requerimiento' });
  }
};

const createRequerimiento = async (req, res) => {
  try {
    const data = req.body;
    const nuevoRequerimiento = await RequerimientoEmprendedor.createRequerimiento(data);
    res.status(201).json(nuevoRequerimiento);
  } catch (error) {
    console.error('Error en createRequerimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateRequerimiento = async (req, res) => {
  try {
    const { id_req } = req.params;
    const data = req.body;
    const requerimientoActualizado = await RequerimientoEmprendedor.updateRequerimiento(id_req, data);
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
    const { id_req } = req.params;
    const eliminada = await RequerimientoEmprendedor.deleteRequerimiento(id_req);
    if (!eliminada) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json({ message: 'Requerimiento eliminado', requerimiento: eliminada });
  } catch (err) {
    console.error('Error en deleteRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRequerimientos,
  getRequerimientoById,
  createRequerimiento,
  updateRequerimiento,
  deleteRequerimiento
};