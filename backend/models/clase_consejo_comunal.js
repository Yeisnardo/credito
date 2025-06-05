const { query } = require('../config/db');

class ConsejoComunal {
  static validarConsejo(consejo) {
    const { cedula_persona, consejo_nombre, comuna, sector } = consejo;
    if (!cedula_persona || !consejo_nombre || !comuna || !sector) {
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
    const { cedula_persona, consejo_nombre, comuna, sector } = consejoData;
    const resultado = await query(
      `INSERT INTO consejo_comunal (cedula_persona, consejo_nombre, comuna, sector)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cedula_persona, consejo_nombre, comuna, sector]
    );
    return resultado.rows[0];
  }

  static async updateConsejo(cedula_persona, consejoData) {
    const { consejo_nombre, comuna, sector } = consejoData;
    if (!cedula_persona || !consejo_nombre || !comuna || !sector) {
      throw new Error("Campos obligatorios incompletos");
    }
    const resultado = await query(
      `UPDATE consejo_comunal SET
        consejo_nombre = $1,
        comuna = $2,
        sector = $3
       WHERE cedula_persona = $4
       RETURNING *`,
      [consejo_nombre, comuna, sector, cedula_persona]
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