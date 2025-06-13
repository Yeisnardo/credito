// controllers/perfilController.js
const Perfil = require('../models/clase_perfil');

const getPerfiles = async (req, res) => {
  try {
    const resultados = await Perfil.getPerfiles();
    const perfiles = resultados.map(row => ({
      id: row.cedula,
      solicitante: row.nombre_completo,
      contrato: null,
      estado: row.estado,
      foto: "https://via.placeholder.com/150",
      detalles: {
        emprendimiento: row.nombre_emprendimiento,
        requerimientos: row.consejo_nombre,
        datosPersonales: {
          nombre: row.nombre_completo,
          email: row.email,
          telefono: row.telefono,
          direccion: row.direccion_actual,
        },
      },
    }));
    res.json(perfiles);
  } catch (err) {
    console.error('Error en getPerfiles:', err);
    res.status(500).json({ error: 'Error al obtener perfiles' });
  }
};

const getPerfil = async (req, res) => {
  const { cedula } = req.params;
  try {
    const perfil = await Perfil.getPerfil(cedula);
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    res.json(perfil);
  } catch (err) {
    console.error('Error en getPerfil:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const createPerfil = async (req, res) => {
  const perfilData = req.body;
  try {
    await Perfil.createPerfil(perfilData);
    res.status(201).json({ message: 'Perfil creado' });
  } catch (err) {
    console.error('Error en createPerfil:', err);
    res.status(500).json({ error: 'Error al crear perfil' });
  }
};

const updatePerfil = async (req, res) => {
  const { cedula } = req.params;
  const perfilData = req.body;
  try {
    await Perfil.updatePerfil(cedula, perfilData);
    res.json({ message: 'Perfil actualizado' });
  } catch (err) {
    console.error('Error en updatePerfil:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const deletePerfil = async (req, res) => {
  const { cedula } = req.params;
  try {
    await Perfil.deletePerfil(cedula);
    res.json({ message: 'Perfil eliminado' });
  } catch (err) {
    console.error('Error en deletePerfil:', err);
    res.status(500).json({ error: 'Error al eliminar perfil' });
  }
};

module.exports = {
  getPerfiles,
  getPerfil,
  createPerfil,
  updatePerfil,
  deletePerfil,
};