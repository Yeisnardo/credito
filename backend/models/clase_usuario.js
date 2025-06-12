const { query } = require('../config/db');

class Usuario {
  static validarUsuario(usuario) {
    const {
      cedula_usuario,
      usuario: nombreUsuario,
      clave,
      rol,
      estatus,
    } = usuario;

    if (!cedula_usuario || !nombreUsuario || !clave || !rol || !estatus) {
      throw new Error('Campos obligatorios incompletos');
    }
  }

  static async getUsuarioPorCedula(cedula) {
    const resultado = await query(
      'SELECT * FROM usuario WHERE cedula_usuario = $1',
      [cedula]
    );
    return resultado.rows[0];
  }

  static async getUsuarios() {
    const resultado = await query(`
      SELECT 
        u.cedula_usuario, 
        p.nombre_completo, 
        p.edad, 
        p.telefono, 
        p.email, 
        p.estado, 
        p.municipio, 
        p.direccion_actual, 
        p.tipo_persona,
        u.usuario, 
        u.clave, 
        u.rol, 
        u.estatus
      FROM usuario u
      LEFT JOIN persona p ON u.cedula_usuario = p.cedula
    `);
    return resultado.rows.map((row) => ({
      cedula_usuario: row.cedula_usuario,
      nombre: row.nombre_completo || '',
      edad: row.edad || null,
      telefono: row.telefono || '',
      email: row.email || '',
      estado: row.estado || '',
      municipio: row.municipio || '',
      direccion_actual: row.direccion_actual || '',
      tipo_persona: row.tipo_persona || '',
      usuario: row.usuario,
      clave: row.clave,
      tipo_usuario: row.rol,
      estatus: row.estatus,
    }));
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
      `
      INSERT INTO usuario (cedula_usuario, usuario, clave, rol, estatus)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [cedula_usuario, nombreUsuario, clave, rol, estatus]
    );
    return resultado.rows[0];
  }

  static async updateUsuario(cedula_usuario, usuarioData) {
    const { usuario: nombreUsuario, clave, rol, estatus } = usuarioData;

    if (!nombreUsuario || !rol || !clave || !estatus) {
      throw new Error('Campos obligatorios incompletos');
    }

    const resultado = await query(
      `
      UPDATE usuario SET
        usuario = $1,
        clave = $2,
        rol = $3,
        estatus = $4
      WHERE cedula_usuario = $5
      RETURNING *
    `,
      [nombreUsuario, clave, rol, estatus, cedula_usuario]
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

  static async deleteUsuario(cedula_usuario) {
    const resultado = await query(
      'DELETE FROM usuario WHERE cedula_usuario = $1 RETURNING *',
      [cedula_usuario]
    );
    return resultado.rows[0];
  }
}

module.exports = Usuario;