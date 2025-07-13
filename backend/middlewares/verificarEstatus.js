// middlewares/verificarEstatus.js
const { query } = require('../config/conexion');

const verificarEstatusUsuario = async (req, res, next) => {
  try {
    // Suponiendo que envías el nombre de usuario o identificador en el body, headers, o token
    const { usuario } = req.body; // o extrae de token JWT si usas autenticación con tokens
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no proporcionado' });
    }

    const result = await query('SELECT * FROM usuario WHERE cedula_usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (user.estatus !== 'Activo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Puedes adjuntar el usuario a req si quieres usarlo más adelante
    req.usuario = user;

    next();
  } catch (err) {
    console.error('Error en verificarEstatusUsuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = verificarEstatusUsuario;
