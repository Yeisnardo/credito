const { query } = require("../config/db");

class Usuario {
  static validarUsuario(usuario) {
    console.log("Datos del usuario:", usuario);
    const {
      cedula_usuario,
      usuario: nombreUsuario,
      clave,
      rol,
      estatus,
    } = usuario;

    // Validación de campos obligatorios
    if (!cedula_usuario || !nombreUsuario || !clave || !rol || !estatus) {
      throw new Error("Campos obligatorios incompletos");
    }
  }

  static async getUsuarios() {
    const resultado = await query("SELECT * FROM usuario");
    return resultado.rows;
  }

  static async createUsuario(usuarioData) {
    this.validarUsuario(usuarioData);
    const {
      cedula_usuario,
      usuario: nombreUsuario,
      clave,
      rol,
      estatus,
    } = usuarioData;

    const resultado = await query(
      `INSERT INTO usuario (
        cedula_usuario, usuario, clave, rol, estatus
      ) VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cedula_usuario, nombreUsuario, clave, rol, estatus]
    );
    return resultado.rows[0];
  }

  static async updateUsuario(cedula_usuario, usuarioData) {
    const { usuario: nombreUsuario, clave, rol, estatus } = usuarioData;

    if (!nombreUsuario || !rol || !clave || !estatus) {
      throw new Error("Campos obligatorios incompletos");
    }

    const resultado = await query(
      `UPDATE usuario SET 
        usuario = $1, 
        clave = $2, 
        rol = $3, 
        estatus = $4
       WHERE cedula_usuario = $5 RETURNING *`,
      [nombreUsuario, clave, rol, estatus, cedula_usuario]
    );
    return resultado.rows[0];
  }

  static async getUsuarioPorUsuario(nombreUsuario) {
    const resultado = await query("SELECT * FROM usuario WHERE usuario = $1", [
      nombreUsuario,
    ]);
    return resultado.rows[0];
  }

  static async getUsuarioPorUsuario(nombreUsuario) {
    const resultado = await query("SELECT * FROM usuario WHERE usuario = $1", [
      nombreUsuario,
    ]);
    return resultado.rows[0];
  }

  static async updateEstatusUsuario(cedula, estatus) {
    const resultado = await query(
      "UPDATE usuario SET estatus = $1 WHERE cedula_usuario = $2 RETURNING *",
      [estatus, cedula]
    );
    return resultado.rows[0];
  }
}

module.exports = Usuario;
