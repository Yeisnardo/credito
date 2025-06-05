const { query } = require('../config/db');

class Usuario {
  static validarUsuario(usuario) {
    console.log('Datos del usuario:', usuario); // Agregar esta línea
  const {
    cedula_usuario,
    usuario: nombreUsuario,
    contrasena,
    rol,
    tipo_usuario,
    estatus,
    foto_rostro
  } = usuario;

  // Validación de campos obligatorios
  if (
    !cedula_usuario ||
    !nombreUsuario ||
    !contrasena ||
    !rol ||
    !tipo_usuario ||
    !estatus
  ) {
    throw new Error("Campos obligatorios incompletos");
  }

  // Validar tipo de foto si está presente
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
      cedula_usuario,
      usuario: nombreUsuario,
      contrasena,
      rol,
      estatus,
      tipo_usuario,
      foto_rostro
    } = usuarioData;

    const bufferFoto = foto_rostro ? Buffer.from(foto_rostro, 'base64') : null;

    const resultado = await query(
      `INSERT INTO usuario (
        cedula_usuario, usuario, contrasena, rol, estatus, tipo_usuario, foto_rostro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cedula_usuario, nombreUsuario, contrasena, rol, estatus, tipo_usuario, bufferFoto]
    );
    return resultado.rows[0];
  }

  static async updateUsuario(cedula_usuario, usuarioData) {
    const {
      usuario: nombreUsuario,
      contrasena,
      rol,
      estatus,
      tipo_usuario,
      foto_rostro
    } = usuarioData;

    if (!nombreUsuario || !rol) {
      throw new Error('Campos obligatorios incompletos');
    }

    const bufferFoto = foto_rostro ? Buffer.from(foto_rostro, 'base64') : null;

    const resultado = await query(
      `UPDATE usuario SET 
        usuario = $1, 
        contrasena = $2, 
        rol = $3, 
        estatus = $4, 
        tipo_usuario = $5, 
        foto_rostro = COALESCE($6, foto_rostro)
       WHERE cedula_usuario = $7 RETURNING *`,
      [
        nombreUsuario,
        contrasena,
        rol,
        estatus,
        tipo_usuario,
        bufferFoto,
        cedula_usuario
      ]
    );
    return resultado.rows[0];
  }

  static async deleteUsuario(cedula_usuario) {
    const resultado = await query(
      'DELETE FROM usuario WHERE cedula_usuario = $1 RETURNING *',
      [cedula_usuario]
    );
    return resultado.rows[0];
  }

  static async getUsuarioPorUsuario(nombreUsuario) {
    const resultado = await query(
      'SELECT * FROM usuario WHERE usuario = $1',
      [nombreUsuario]
    );
    return resultado.rows[0];
  }

  static async updateEstatusUsuario(cedula, estatus) {
    const resultado = await query(
      'UPDATE usuario SET estatus = $1 WHERE cedula_usuario = $2 RETURNING *',
      [estatus, cedula]
    );
    return resultado.rows[0];
  }
}

module.exports = Usuario;