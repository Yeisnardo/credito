const { query } = require('../config/db');

class Clasificacion {
  static async getClasificaciones() {
    const resultado = await query('SELECT * FROM clasificacion');
    return resultado.rows;
  }

  static async createClasificacion(clasificacionData) {
    const { sector, negocio } = clasificacionData;
    const resultado = await query(
      `INSERT INTO clasificacion (sector, negocio) VALUES ($1, $2) RETURNING *`,
      [sector ?? null, negocio ?? null]
    );
    return resultado.rows[0];
  }

  static async updateClasificacion(id_clasificacion, clasificacionData) {
    const { sector, negocio } = clasificacionData;
    const resultado = await query(
      `UPDATE clasificacion SET sector = $1, negocio = $2 WHERE id_clasificacion = $3 RETURNING *`,
      [sector ?? null, negocio ?? null, id_clasificacion]
    );
    return resultado.rows[0];
  }
}

module.exports = Clasificacion;