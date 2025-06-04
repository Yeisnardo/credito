const { query } = require('../config/db');

class Usuario {
  static validarUsuario(usuario) {
    const { cedula, usuario: nombreUsuario, contrasena, rol, tipo_usuario, estatus, foto_rostro } = usuario;
    if (!cedula || !nombreUsuario || !contrasena || !rol || !tipo_usuario) {
      throw new Error("Campos obligatorios incompletos");
    }
    if (foto_rostro && typeof foto_rostro !== 'string') {
      throw new Error("La foto debe ser una cadena en base64");
    }
  }

  static async getUsuarios() {
    const resultado = await query('SELECT * FROM usuario');
    return resultado.rows;
  }

  static async createUsuario(usuarioData) {
    this.validarUsuario(usuarioData);
    const {
      cedula,
      usuario: nombreUsuario,
      contrasena,
      rol,
      estatus,
      tipo_usuario,
      foto_rostro
    } = usuarioData;

    const bufferFoto = foto_rostro ? Buffer.from(foto_rostro, 'base64') : null;

    const resultado = await query(
      `INSERT INTO usuario (cedula, usuario, contrasena, rol, estatus, tipo_usuario, foto_rostro)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cedula, nombreUsuario, contrasena, rol, estatus, tipo_usuario, bufferFoto]
    );
    return resultado.rows[0];
  }

  static async updateUsuario(cedula, usuarioData) {
    const { usuario: nombreUsuario, contrasena, rol, estatus, tipo_usuario, foto_rostro } = usuarioData;

    if (!nombreUsuario || !rol) {
      throw new Error('Campos obligatorios incompletos');
    }

    const resultado = await query(
      `UPDATE usuario SET 
        usuario = $1, 
        contrasena = $2, 
        rol = $3, 
        estatus = $4, 
        tipo_usuario = $5, 
        foto_rostro = COALESCE($6, foto_rostro)
       WHERE cedula = $7 RETURNING *`,
      [
        nombreUsuario,
        contrasena,
        rol,
        estatus,
        tipo_usuario,
        foto_rostro ? Buffer.from(foto_rostro, 'base64') : null,
        cedula
      ]
    );
    return resultado.rows[0];
  }

  static async deleteUsuario(cedula) {
    const resultado = await query('DELETE FROM usuario WHERE cedula = $1 RETURNING *', [cedula]);
    return resultado.rows[0];
  }

  static async getUsuarioPorUsuario(nombreUsuario) {
    const resultado = await query('SELECT * FROM usuario WHERE usuario = $1', [nombreUsuario]);
    return resultado.rows[0];
  }

  static async updateEstatusUsuario(cedula, estatus) {
    const resultado = await query(
      'UPDATE usuario SET estatus = $1 WHERE cedula = $2 RETURNING *',
      [estatus, cedula]
    );
    return resultado.rows[0];
  }
}

module.exports = Usuario;