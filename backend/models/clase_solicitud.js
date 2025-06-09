// models/clase_emprendimiento.js
const { query } = require('../config/db');

class Emprendimiento {
  // Obtener todos los emprendimientos con datos del emprendedor
  static async getAllWithEmprendedor() {
    const resultado = await query(`
      SELECT e.*, p.nombre_completo, p.email
      FROM emprendimientos e
      JOIN persona p ON e.cedula_emprendedor = p.cedula
    `);
    return resultado.rows;
  }

  // Obtener emprendimientos por cédula del emprendedor
  static async getByCedulaEmprendedor(cedula) {
    const resultado = await query(`
      SELECT e.*, p.nombre_completo, p.email
      FROM emprendimientos e
      JOIN persona p ON e.cedula_emprendedor = p.cedula
      WHERE e.cedula_emprendedor = $1
    `, [cedula]);
    return resultado.rows;
  }

  // Crear nuevo emprendimiento
  static async createEmprendimiento(data) {
    const {
      cedula_emprendedor,
      tipo_sector,
      tipo_negocio,
      nombre_emprendimiento,
      consejo_nombre,
      comuna,
      direccion_emprendimiento
    } = data;

    const resultado = await query(
      `INSERT INTO emprendimientos (
        cedula_emprendedor,
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        consejo_nombre,
        comuna,
        direccion_emprendimiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        cedula_emprendedor,
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        consejo_nombre,
        comuna,
        direccion_emprendimiento
      ]
    );
    return resultado.rows[0];
  }
}

module.exports = Emprendimiento;