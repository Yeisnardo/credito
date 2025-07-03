const { query } = require('../config/db');

class RequerimientoEmprendedor {
  static async getRequerimientos() {
    try {
      const resultado = await query(`
        SELECT re.id_requerimientos, re.nombre_requerimiento, reem.id_req, reem.cedula_requerimiento, reem.opt_requerimiento
        FROM requerimientos re
        LEFT JOIN requerimiento_emprendedor reem ON re.id_requerimientos = reem.id_req
      `);
      return resultado.rows;
    } catch (error) {
      console.error('Error en getRequerimientos:', error);
      throw error;
    }
  }

  static async getRequerimientoById(id_req) {
    try {
      const resultado = await query(`
        SELECT re.id_requerimientos, re.nombre_requerimiento, reem.id_req, reem.cedula_requerimiento, reem.opt_requerimiento
        FROM requerimientos re
        LEFT JOIN requerimiento_emprendedor reem ON re.id_requerimientos = reem.id_req
        WHERE reem.id_req = $1
      `, [id_req]);
      return resultado.rows[0]; // Solo un objeto
    } catch (error) {
      console.error('Error en getRequerimientoById:', error);
      throw error;
    }
  }

  static async createRequerimiento(data) {
    try {
      const {
        cedula_requerimiento,
        opt_requerimiento,
      } = data;

      const resultado = await query(
        `INSERT INTO requerimiento_emprendedor (
          cedula_requerimiento,
          opt_requerimiento
        ) VALUES ($1, $2) RETURNING *`,
        [cedula_requerimiento, opt_requerimiento]
      );
      return resultado.rows[0];
    } catch (error) {
      console.error('Error en createRequerimiento:', error);
      throw error;
    }
  }

  static async updateRequerimiento(id_req, data) {
    try {
      const {
        cedula_requerimiento,
        opt_requerimiento,
        requerimiento_id,
      } = data;

      const resultado = await query(
        `UPDATE requerimiento_emprendedor SET
          cedula_requerimiento = $1,
          opt_requerimiento = $2,
          requerimiento_id = $3
        WHERE id_req = $4
        RETURNING *`,
        [cedula_requerimiento, opt_requerimiento, requerimiento_id, id_req]
      );
      return resultado.rows[0];
    } catch (error) {
      console.error('Error en updateRequerimiento:', error);
      throw error;
    }
  }

  static async deleteRequerimiento(id_req) {
    try {
      const resultado = await query('DELETE FROM requerimiento_emprendedor WHERE id_req = $1 RETURNING *', [id_req]);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error en deleteRequerimiento:', error);
      throw error;
    }
  }
}

module.exports = RequerimientoEmprendedor;