const Requerimiento = require('../models/clase_requerimientos');

const getRequerimientos = async (req, res) => {
  try {
    const requerimientos = await Requerimiento.getRequerimientos();
    res.json(requerimientos);
  } catch (err) {
    console.error('Error en getRequerimientos:', err);
    res.status(500).json({ error: 'Error al obtener requerimientos' });
  }
};


const createRequerimiento = async (req, res) => {
  try {
    const { nombre_requerimiento } = req.body;
    const nuevoRequerimiento = await Requerimiento.createRequerimiento({ nombre_requerimiento });
    res.status(201).json(nuevoRequerimiento);
  } catch (error) {
    console.error('Error en createRequerimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateRequerimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_requerimiento } = req.body;
    const requerimientoActualizado = await Requerimiento.updateRequerimiento(id, { nombre_requerimiento });
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
    const { id } = req.params;
    const requerimientoEliminado = await Requerimiento.deleteRequerimiento(id);
    if (!requerimientoEliminado) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json({ message: 'Requerimiento eliminado', requerimiento: requerimientoEliminado });
  } catch (err) {
    console.error('Error en deleteRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRequerimientos,
  createRequerimiento,
  updateRequerimiento,
  deleteRequerimiento
};