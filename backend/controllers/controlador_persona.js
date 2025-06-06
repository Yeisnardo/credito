const Persona = require('../models/clase_persona');

const getPersonas = async (req, res) => {
  try {
    const personas = await Persona.getPersona();
    res.json(personas);
  } catch (err) {
    console.error('Error en getPersonas:', err);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
};

const getUnaPersona = async (req, res) => {
  try {
    const { cedula } = req.params;
    const persona = await Persona.getUnaPersona(cedula);
    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json(persona);
  } catch (err) {
    console.error('Error en getUnaPersona:', err);
    res.status(500).json({ error: 'Error al obtener la persona' });
  }
};

const createPersona = async (req, res) => {
  try {
    const personaData = req.body;
    const nuevaPersona = await Persona.createPersona(personaData);
    res.status(201).json(nuevaPersona);
  } catch (error) {
    console.error('Error en createPersona:', error);
    res.status(500).json({ error: error.message });
  }
};

const updatePersona = async (req, res) => {
  try {
    const { cedula } = req.params;
    const personaData = req.body;
    const personaActualizada = await Persona.updatePersona(cedula, personaData);
    if (!personaActualizada) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json(personaActualizada);
  } catch (err) {
    console.error('Error en updatePersona:', err);
    res.status(500).json({ error: err.message });
  }
};

const deletePersona = async (req, res) => {
  try {
    const { cedula } = req.params;
    const personaEliminada = await Persona.deletePersona(cedula);
    if (!personaEliminada) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json({ message: 'Persona eliminada', persona: personaEliminada });
  } catch (err) {
    console.error('Error en deletePersona:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPersonas,
  getUnaPersona,
  createPersona,
  updatePersona,
  deletePersona
};