// models/clase_aprobacion.js
const { query } = require('../config/db');

class Aprobacion {
  static async getAprobaciones() {
    const resultado = await query('SELECT * FROM aprobacion');
    return resultado.rows;
  }

  static async getAprobacionPorCedula(cedula) {
    const resultado = await query(
      'SELECT * FROM aprobacion WHERE cedula_aprobacion = $1',
      [cedula]
    );
    return resultado.rows[0];
  }
}

module.exports = Aprobacion;