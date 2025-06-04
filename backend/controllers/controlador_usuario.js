// controllers/usuarioController.js
const Usuario = require('../models/clase_usuario');

const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.getUsuario();
    const usuariosConFotoBase64 = usuarios.map(usuario => ({
      ...usuario,
      foto_rostro: usuario.foto_rostro ? usuario.foto_rostro.toString('base64') : null
    }));
    res.json(usuariosConFotoBase64);
  } catch (err) {
    console.error('Error en getUsuario:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const createUsuario = async (req, res) => {
  try {
    const usuarioData = req.body;
    const nuevoUsuario = await Usuario.createUsuario(usuarioData);
    if (nuevoUsuario.foto_rostro) {
      nuevoUsuario.foto_rostro = nuevoUsuario.foto_rostro.toString('base64');
    }
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('Error en createUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { cedula } = req.params; // Aquí el parámetro es cedula
    const usuarioData = req.body;
    const usuarioActualizado = await Usuario.updateUsuario(cedula, usuarioData);
    if (usuarioActualizado.foto_rostro) {
      usuarioActualizado.foto_rostro = usuarioActualizado.foto_rostro.toString('base64');
    }
    res.json(usuarioActualizado);
  } catch (err) {
    console.error('Error en updateUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { cedula } = req.params;
    const usuarioEliminado = await Usuario.deleteUsuario(cedula);
    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado', usuario: usuarioEliminado });
  } catch (err) {
    console.error('Error en deleteUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    const user = await Usuario.getUsuarioPorUsuario(usuario);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    // Aquí deberías usar bcrypt.compare si las contraseñas están hashed
    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    if (user.foto_rostro) {
      user.foto_rostro = user.foto_rostro.toString('base64');
    }
    res.json({ message: 'Inicio de sesión exitoso', user });
  } catch (err) {
    console.error('Error en loginUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateEstatusUsuario = async (req, res) => {
  try {
    const { cedula } = req.params;
    const { estatus } = req.body;
    const usuarioActualizado = await Usuario.updateEstatusUsuario(cedula, estatus);
    res.json(usuarioActualizado);
  } catch (err) {
    console.error('Error en updateEstatusUsuario:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  updateEstatusUsuario,
};