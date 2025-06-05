const ConsejoComunal = require('../models/clase_consejo_comunal');

const consejoController = {
  obtenerConsejos: async (req, res) => {
    try {
      const consejos = await ConsejoComunal.getConsejos();
      res.json(consejos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  obtenerUnConsejo: async (req, res) => {
    const { cedula_persona } = req.params;
    try {
      const consejo = await ConsejoComunal.getUnaConsejo(cedula_persona);
      if (consejo) {
        res.json(consejo);
      } else {
        res.status(404).json({ message: 'Consejo no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  crearConsejo: async (req, res) => {
    const data = req.body;
    try {
      const nuevoConsejo = await ConsejoComunal.createConsejo(data);
      res.status(201).json(nuevoConsejo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  actualizarConsejo: async (req, res) => {
    const { cedula_persona } = req.params;
    const data = req.body;
    try {
      const consejoActualizado = await ConsejoComunal.updateConsejo(cedula_persona, data);
      if (consejoActualizado) {
        res.json(consejoActualizado);
      } else {
        res.status(404).json({ message: 'Consejo no encontrado' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  eliminarConsejo: async (req, res) => {
    const { cedula_persona } = req.params;
    try {
      const eliminado = await ConsejoComunal.deleteConsejo(cedula_persona);
      if (eliminado) {
        res.json({ message: 'Consejo eliminado' });
      } else {
        res.status(404).json({ message: 'Consejo no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = consejoController;