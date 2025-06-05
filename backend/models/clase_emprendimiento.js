const { query } = require('../config/db');

class Emprendimiento {
  static validarEmprendimiento(emprendimiento) {
    const { cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento } = emprendimiento;
    if (!cedula_emprendedor || !tipo_sector || !tipo_negocio || !nombre_emprendimiento || !direccion_emprendimiento) {
      throw new Error("Campos obligatorios incompletos");
    }
    // Validaciones adicionales si es necesario
  }

  static async getEmprendimientos() {
    const resultado = await query('SELECT * FROM emprendimientos');
    return resultado.rows;
  }

  static async getUnaEmprendimiento(cedula_emprendedor) {
    const resultado = await query(
      'SELECT * FROM emprendimientos WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );
    return resultado.rows[0];
  }

  static async createEmprendimiento(emprendimientoData) {
    this.validarEmprendimiento(emprendimientoData);
    const { cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento } = emprendimientoData;
    const resultado = await query(
      `INSERT INTO emprendimientos (cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento]
    );
    return resultado.rows[0];
  }

  static async updateEmprendimiento(cedula_emprendedor, emprendimientoData) {
    const { tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento } = emprendimientoData;
    if (!tipo_sector || !tipo_negocio || !nombre_emprendimiento || !direccion_emprendimiento) {
      throw new Error("Campos obligatorios incompletos");
    }
    const resultado = await query(
      `UPDATE emprendimientos SET
        tipo_sector = $1,
        tipo_negocio = $2,
        nombre_emprendimiento = $3,
        direccion_emprendimiento = $4
       WHERE cedula_emprendedor = $5
       RETURNING *`,
      [tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento, cedula_emprendedor]
    );
    return resultado.rows[0];
  }

  static async deleteEmprendimiento(cedula_emprendedor) {
    const resultado = await query(
      'DELETE FROM emprendimientos WHERE cedula_emprendedor = $1 RETURNING *',
      [cedula_emprendedor]
    );
    return resultado.rows[0];
  }
}

module.exports = Emprendimiento;