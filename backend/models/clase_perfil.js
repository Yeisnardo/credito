// models/PerfilModel.js
const { query } = require("../config/db");

class PerfilModel {
  // Obtener todos los perfiles con detalles de emprendimientos
  static async getPerfiles() {
    const resultado = await query(`
      SELECT p.cedula, p.nombre_completo, p.email, p.telefono, p.estado, p.municipio, p.direccion_actual,
             e.tipo_sector, e.tipo_negocio, e.nombre_emprendimiento, e.consejo_nombre, e.comuna, e.direccion_emprendimiento
      FROM persona p
      LEFT JOIN emprendimientos e ON p.cedula = e.cedula_emprendedor
    `);
    return resultado.rows;
  }

  // Obtener un perfil por cédula
  static async getPerfil(cedula) {
    const resultado = await query("SELECT * FROM persona WHERE cedula = $1", [cedula]);
    return resultado.rows[0];
  }

  // Crear un nuevo perfil
  static async createPerfil(perfilData) {
    await query(
      "INSERT INTO persona (cedula, nombre_completo, email, telefono, estado, municipio, direccion_actual) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        perfilData.cedula,
        perfilData.nombre_completo,
        perfilData.email,
        perfilData.telefono,
        perfilData.estado,
        perfilData.municipio,
        perfilData.direccion,
      ]
    );
  }

  // Actualizar un perfil existente
  static async updatePerfil(cedula, perfilData) {
    await query(
      "UPDATE persona SET nombre_completo=$1, email=$2, telefono=$3, estado=$4, municipio=$5, direccion_actual=$6 WHERE cedula=$7",
      [
        perfilData.nombre_completo,
        perfilData.email,
        perfilData.telefono,
        perfilData.estado,
        perfilData.municipio,
        perfilData.direccion,
        cedula,
      ]
    );
  }

  // Eliminar un perfil
  static async deletePerfil(cedula) {
    await query("DELETE FROM persona WHERE cedula=$1", [cedula]);
  }

  // Nuevo método: obtener perfiles por estado
  static async getPerfilesPorEstado(estado) {
    const resultado = await query(
      `
      SELECT p.cedula, p.nombre_completo, p.email, p.telefono, p.estado, p.municipio, p.direccion_actual,
             e.tipo_sector, e.tipo_negocio, e.nombre_emprendimiento, e.consejo_nombre, e.comuna, e.direccion_emprendimiento
      FROM persona p
      LEFT JOIN emprendimientos e ON p.cedula = e.cedula_emprendedor
      WHERE p.estado = $1
      `,
      [estado]
    );
    return resultado.rows;
  }

  // Nuevo método: obtener perfiles por municipio
  static async getPerfilesPorMunicipio(municipio) {
    const resultado = await query(
      `
      SELECT p.cedula, p.nombre_completo, p.email, p.telefono, p.estado, p.municipio, p.direccion_actual,
             e.tipo_sector, e.tipo_negocio, e.nombre_emprendimiento, e.consejo_nombre, e.comuna, e.direccion_emprendimiento
      FROM persona p
      LEFT JOIN emprendimientos e ON p.cedula = e.cedula_emprendedor
      WHERE p.municipio = $1
      `,
      [municipio]
    );
    return resultado.rows;
  }
}

module.exports = PerfilModel;