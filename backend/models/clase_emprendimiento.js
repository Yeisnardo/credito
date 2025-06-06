const { query } = require('../config/db');

class Emprendimiento {
  static validarEmprendimiento(emprendimiento) {
    const { cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento, consejo_nombre, comuna } = emprendimiento;
    if (
      !cedula_emprendedor ||
      !tipo_sector ||
      !tipo_negocio ||
      !nombre_emprendimiento ||
      !direccion_emprendimiento ||
      !consejo_nombre ||
      !comuna
    ) {
      throw new Error("Campos obligatorios incompletos");
    }
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
    const {
      cedula_emprendedor,
      tipo_sector,
      tipo_negocio,
      nombre_emprendimiento,
      direccion_emprendimiento,
      consejo_nombre,
      comuna
    } = emprendimientoData;

    const resultado = await query(
      `INSERT INTO emprendimientos (
        cedula_emprendedor,
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        direccion_emprendimiento,
        consejo_nombre,
        comuna
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
      [
        cedula_emprendedor,
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        direccion_emprendimiento,
        consejo_nombre,
        comuna
      ]
    );
    return resultado.rows[0];
  }

  static async updateEmprendimiento(cedula_emprendedor, emprendimientoData) {
    this.validarEmprendimiento(emprendimientoData);
    const {
      tipo_sector,
      tipo_negocio,
      nombre_emprendimiento,
      direccion_emprendimiento,
      consejo_nombre,
      comuna
    } = emprendimientoData;

    const resultado = await query(
      `UPDATE emprendimientos SET
        tipo_sector = $1,
        tipo_negocio = $2,
        nombre_emprendimiento = $3,
        direccion_emprendimiento = $4,
        consejo_nombre = $5,
        comuna = $6
       WHERE cedula_emprendedor = $7
       RETURNING *`,
      [
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        direccion_emprendimiento,
        consejo_nombre,
        comuna,
        cedula_emprendedor
      ]
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