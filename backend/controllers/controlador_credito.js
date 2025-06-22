const Credito = require('../models/clase_credito');

const getCreditos = async (req, res) => {
  try {
    const creditos = await Credito.getCreditos();
    res.json(creditos);
  } catch (err) {
    console.error('Error en getCreditos:', err);
    res.status(500).json({ error: 'Error al obtener créditos' });
  }
};

module.exports = {
  getCreditos
};
