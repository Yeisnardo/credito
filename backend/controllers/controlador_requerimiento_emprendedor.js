const RequerimientoEmprendedor = require('../models/clase_requerimiento_emprendedor');

const createRequerimientoEmprendedor = async (req, res) => {
  try {
    const data = req.body;
    const nuevoRequerimiento = await RequerimientoEmprendedor.createRequerimientoEmprendedor(data);
    res.status(201).json(nuevoRequerimiento);
  } catch (error) {
    console.error('Error en createRequerimientoEmprendedor:', error);
    res.status(500).json({ error: error.message });
  }
};

const getRequerimientoEmprendedor = async (req, res) => {
  try {
    const { id_req } = req.params;
    const requerimiento = await RequerimientoEmprendedor.getRequerimientoPorId(id_req);
    if (requerimiento) {
      res.json(requerimiento);
    } else {
      res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
  } catch (error) {
    console.error('Error en getRequerimientoEmprendedor:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequerimientoEmprendedor,
  getRequerimientoEmprendedor,
};