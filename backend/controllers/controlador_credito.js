// src/controllers/controlador_credito.js
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

const crearCredito = async (req, res) => {
  const {
    cedula_credito,
    referencia,
    monto_euros,
    monto_bs,
    diez_euros,
    fecha_desde,
    fecha_hasta,
    estatus,
    cuota, // Nuevo campo
  } = req.body;

  if (!estatus) {
    return res.status(400).json({ error: 'El campo estatus es obligatorio' });
  }

  try {
    const nuevoCredito = await Credito.crearCredito({
      cedula_credito,
      referencia,
      monto_euros,
      monto_bs,
      diez_euros,
      fecha_desde,
      fecha_hasta,
      estatus,
      cuota, // pasado
    });
    res.status(201).json(nuevoCredito);
  } catch (err) {
    console.error('Error al crear crédito:', err);
    res.status(500).json({ error: 'Error al crear crédito' });
  }
};

// Nuevo: obtener créditos por cédula
const getCreditosPorCedula = async (req, res) => {
  const { cedula_credito } = req.params;

  if (!cedula_credito) {
    return res.status(400).json({ error: 'La cédula es obligatoria' });
  }

  try {
    const creditos = await Credito.getCreditosPorCedula(cedula_credito);
    res.json(creditos);
  } catch (err) {
    console.error('Error en getCreditosPorCedula:', err);
    res.status(500).json({ error: 'Error al obtener créditos por cédula' });
  }
};

// Actualizar estatus del crédito
const actualizarEstatusCredito = async (req, res) => {
  const { cedula_credito } = req.params;
  const { estatus } = req.body;

  if (!estatus) {
    return res.status(400).json({ error: 'El campo estatus es obligatorio' });
  }

  try {
    const resultado = await Credito.actualizarEstatus(cedula_credito, estatus);
    if (!resultado) {
      return res.status(404).json({ error: 'Crédito no encontrado' });
    }
    res.json(resultado);
  } catch (err) {
    console.error('Error en actualizarEstatusCredito:', err);
    res.status(500).json({ error: 'Error al actualizar el estatus del crédito' });
  }
};

module.exports = {
  getCreditos,
  crearCredito,
  getCreditosPorCedula,
  actualizarEstatusCredito
};