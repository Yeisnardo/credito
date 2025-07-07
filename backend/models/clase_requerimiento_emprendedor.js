const { query } = require('../config/db');

class RequerimientoEmprendedor {
  static async createRequerimientoEmprendedor(data) {
    const {
      id_req,
      cedula_requerimiento,
      opt_requerimiento
    } = data;

    const resultado = await query(
      `INSERT INTO requerimiento_emprendedor (
        id_req,
        cedula_requerimiento,
        opt_requerimiento
      ) VALUES ($1, $2, $3) RETURNING *`,
      [id_req, cedula_requerimiento, opt_requerimiento]
    );
    return resultado.rows[0];
  }

  static async getRequerimientoPorId(id_req) {
    const resultado = await query(
      `SELECT * FROM requerimiento_emprendedor WHERE id_req = $1`,
      [id_req]
    );
    return resultado.rows[0];
  }
}

module.exports = RequerimientoEmprendedor;