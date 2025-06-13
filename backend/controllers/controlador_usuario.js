const Usuario = require('../models/clase_usuario');

const getUsuarioPorCedula = async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const usuario = await Usuario.getUsuarioPorCedula(cedula_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error('Error en getUsuarioPorCedula:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
};
const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.getUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error('Error en getUsuario:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const createUsuario = async (req, res) => {
  try {
    const usuarioData = req.body;
    const nuevoUsuario = await Usuario.createUsuario(usuarioData);
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('Error en createUsuario:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const usuarioData = req.body;
    const usuarioActualizado = await Usuario.updateUsuario(cedula_usuario, usuarioData);
    res.json(usuarioActualizado);
  } catch (err) {
    console.error('Error en updateUsuario:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const usuarioEliminado = await Usuario.deleteUsuario(cedula_usuario);
    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado', usuario: usuarioEliminado });
  } catch (err) {
    console.error('Error en deleteUsuario:', err);
    res.status(500).json({ message: err.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const user = await Usuario.getUsuarioPorUsuario(usuario);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.estatus && user.estatus.toLowerCase() === 'inactivo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    if (user.clave !== clave) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ message: 'Inicio de sesión exitoso', user });
  } catch (err) {
    console.error('Error en loginUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateEstatusUsuario = async (req, res) => {
  try {
    const { cedula_usuario } = req.params;
    const { estatus } = req.body;
    const usuarioActualizado = await Usuario.updateEstatusUsuario(cedula_usuario, estatus);
    res.json(usuarioActualizado);
  } catch (err) {
    console.error('Error en updateEstatusUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsuarioPorCedula,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  updateEstatusUsuario,
};