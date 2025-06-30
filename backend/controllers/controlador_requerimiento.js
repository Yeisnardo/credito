const requerimientoModel = require('../models/clase_requerimiento');

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

// Nueva función para obtener requerimiento por cédula
const getRequerimiento = async (req, res) => {
  try {
    const cedula_requerimiento = req.params.cedula_requerimiento;
    const requerimiento = await requerimientoModel.getRequerimientoByCedula(cedula_requerimiento);
    res.json(requerimiento);
  } catch (err) {
    console.error('Error en getRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};


// Nuevo método para actualizar requerimiento
const updateRequerimiento = async (req, res) => {
  try {
    const cedula_requerimiento = req.params.cedula_requerimiento;
    const data = req.body;
    const requerimientoActualizado = await requerimientoModel.updateRequerimiento(cedula_requerimiento, data);
    
    if (!requerimientoActualizado) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }

    res.json(requerimientoActualizado);
  } catch (err) {
    console.error('Error en updateRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRequerimiento,
  getRequerimiento,
  updateRequerimiento
};