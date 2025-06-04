// models/clase_consejo_comunal.js
const { query } = require('../config/db');

class ConsejoComunal {
  static validarConsejo(consejo) {
    const { cedula_persona, consejo_nombre, comuna } = consejo;
    if (!cedula_persona || !consejo_nombre || !comuna) {
      throw new Error("Campos obligatorios incompletos");
    }
    // Validaciones adicionales si es necesario
  }

  static async getConsejos() {
    const resultado = await query('SELECT * FROM consejo_comunal');
    return resultado.rows;
  }

  static async getUnaConsejo(cedula_persona) {
    const resultado = await query(
      'SELECT * FROM consejo_comunal WHERE cedula_persona = $1',
      [cedula_persona]
    );
    return resultado.rows[0];
  }

  static async createConsejo(consejoData) {
    this.validarConsejo(consejoData);
    const { cedula_persona, consejo_nombre, comuna } = consejoData;
    const resultado = await query(
      `INSERT INTO consejo_comunal (cedula_persona, consejo_nombre, comuna)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [cedula_persona, consejo_nombre, comuna]
    );
    return resultado.rows[0];
  }

  static async updateConsejo(cedula_persona, consejoData) {
    const { consejo_nombre, comuna } = consejoData;
    if (!cedula_persona || !consejo_nombre || !comuna) {
      throw new Error("Campos obligatorios incompletos");
    }
    const resultado = await query(
      `UPDATE consejo_comunal SET
        consejo_nombre = $1,
        comuna = $2
       WHERE cedula_persona = $3
       RETURNING *`,
      [consejo_nombre, comuna, cedula_persona]
    );
    return resultado.rows[0];
  }

  static async deleteConsejo(cedula_persona) {
    const resultado = await query(
      'DELETE FROM consejo_comunal WHERE cedula_persona = $1 RETURNING *',
      [cedula_persona]
    );
    return resultado.rows[0];
  }
}

module.exports = ConsejoComunal;