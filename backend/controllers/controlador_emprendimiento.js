const emprendimientoModel = require('../models/clase_emprendimiento');

const getEmprendimientos = async (req, res) => {
  try {
    const emprendimientos = await emprendimientoModel.getEmprendimientos();
    res.json(emprendimientos);
  } catch (err) {
    console.error('Error en getEmprendimientos:', err);
    res.status(500).json({ error: 'Error al obtener emprendimientos' });
  }
};

const getUnaEmprendimiento = async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const emprendimiento = await emprendimientoModel.getUnaEmprendimiento(cedula_emprendedor);
    if (!emprendimiento) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json(emprendimiento);
  } catch (err) {
    console.error('Error en getUnaEmprendimiento:', err);
    res.status(500).json({ error: 'Error al obtener el emprendimiento' });
  }
};

const createEmprendimiento = async (req, res) => {
  try {
    const emprendimientoData = req.body;
    const nuevoEmprendimiento = await emprendimientoModel.createEmprendimiento(emprendimientoData);
    res.status(201).json(nuevoEmprendimiento);
  } catch (err) {
    console.error('Error en createEmprendimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateEmprendimiento = async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const emprendimientoData = req.body;
    const emprendimientoActualizado = await emprendimientoModel.updateEmprendimiento(cedula_emprendedor, emprendimientoData);
    if (!emprendimientoActualizado) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json(emprendimientoActualizado);
  } catch (err) {
    console.error('Error en updateEmprendimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteEmprendimiento = async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const emprendimientoEliminado = await emprendimientoModel.deleteEmprendimiento(cedula_emprendedor);
    if (!emprendimientoEliminado) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json({ message: 'Emprendimiento eliminado', emprendimiento: emprendimientoEliminado });
  } catch (err) {
    console.error('Error en deleteEmprendimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEmprendimientos,
  getUnaEmprendimiento,
  createEmprendimiento,
  updateEmprendimiento,
  deleteEmprendimiento
};