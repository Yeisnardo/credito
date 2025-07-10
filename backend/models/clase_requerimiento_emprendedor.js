const { query } = require("../config/db");

class RequerimientoEmprendedor {
  static async createRequerimientoEmprendedor(data) {
    const { cedula_requerimiento, opt_requerimiento } = data;

    const resultado = await query(
      `INSERT INTO requerimiento_emprendedor (
        cedula_requerimiento,
        opt_requerimiento
      ) VALUES ($1, $2) RETURNING *`,
      [cedula_requerimiento, opt_requerimiento]
    );

    return resultado.rows[0];
  }

  static async getRequerimientoYSolicitudPorId(id_req) {
    const resultado = await query(
      `SELECT 
       re.id_req,
       re.cedula_requerimiento,
       re.opt_requerimiento,
       s.cedula_solicitud,
       s.motivo,
       s.estatus
     FROM requerimiento_emprendedor re
     JOIN solicitud s ON re.cedula_requerimiento = s.cedula_solicitud
     WHERE re.id_req = $1`,
      [id_req]
    );
    return resultado.rows[0];
  }
}

module.exports = RequerimientoEmprendedor;
