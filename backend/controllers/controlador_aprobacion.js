const Aprobacion = require('../models/clase_aprobacion');

const getAprobaciones = async (req, res) => {
  try {
    const aprobaciones = await Aprobacion.getAprobaciones();
    res.json(aprobaciones);
  } catch (err) {
    console.error('Error en getAprobaciones:', err);
    res.status(500).json({ error: 'Error al obtener aprobaciones' });
  }
};

const crearAprobacion = async (req, res) => {
  const { cedula_aprobacion, contrato, fecha_aprobacion } = req.body;

  if (!cedula_aprobacion || !contrato || !fecha_aprobacion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const resultado = await require('../models/clase_aprobacion').crearAprobacion({
      cedula_aprobacion,
      contrato,
      fecha_aprobacion,
    });
    res.json(resultado);
  } catch (err) {
    console.error('Error en crearAprobacion:', err);
    res.status(500).json({ error: 'Error al crear aprobación' });
  }
};

module.exports = {
  getAprobaciones,
  crearAprobacion,
};