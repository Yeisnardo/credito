// models/fondo.js
const { query } = require('../config/db');

class Fondo {
  static async getFondos() {
    const resultado = await query('SELECT * FROM fondo');
    return resultado.rows;
  }

  static async createFondo({ fecha, tipo_movimiento, monto, saldo }) {
    const resultado = await query(
      `INSERT INTO fondo (fecha, tipo_movimiento, monto, saldo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [fecha, tipo_movimiento, monto, saldo]
    );
    return resultado.rows[0];
  }
}

module.exports = Fondo;