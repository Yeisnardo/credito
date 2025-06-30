// src/models/clase_credito.js
const { query } = require("../config/db");

class Credito {
  static async getCreditos() {
    const resultado = await query(`
      SELECT 
        p.cedula, 
        p.nombre_completo AS nombre_apellido, 
        a.contrato, 
        a.estatus AS estado, 
        a.fecha_aprobacion,
        c.referencia,
        c.monto_euros,
        c.monto_bs,
        c.diez_euros,
        c.fecha_desde,
        c.fecha_hasta,
        c.estatus,
        c.cuota -- incluir en consulta si quieres verlo en listados
      FROM persona p
      LEFT JOIN aprobacion a ON p.cedula = a.cedula_aprobacion
      LEFT JOIN credito c ON c.cedula_credito = a.cedula_aprobacion
      ORDER BY c.cedula_credito;
    `);
    return resultado.rows;
  }

  static async crearCredito(data) {
    const {
      cedula_credito,
      referencia,
      monto_euros,
      monto_bs,
      diez_euros,
      fecha_desde,
      fecha_hasta,
      estatus,
      cuota, // Nuevo campo
    } = data;

    const montoEurosStr = monto_euros.toString();
    const montoBsStr = monto_bs.toString();
    const diezEurosStr = diez_euros.toString();
    const cuotaStr = cuota ? cuota.toString() : null;

    const insertCreditoQuery = `
      INSERT INTO credito (
        cedula_credito,
        referencia,
        monto_euros,
        monto_bs,
        diez_euros,
        fecha_desde,
        fecha_hasta,
        estatus,
        cuota
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;

    const result = await query(insertCreditoQuery, [
      cedula_credito,
      referencia,
      montoEurosStr,
      montoBsStr,
      diezEurosStr,
      fecha_desde,
      fecha_hasta,
      estatus,
      cuotaStr,
    ]);

    return result.rows[0];
  }

  static async getCreditosPorCedula(cedula_credito) {
    const resultado = await query(
      `
      SELECT *
      FROM credito
      WHERE cedula_credito = $1;
    `,
      [cedula_credito]
    );
    return resultado.rows;
  }

  static async actualizarEstatus(cedula_credito, nuevoEstatus) {
    const resultado = await query(
      `
      UPDATE credito
      SET estatus = $1
      WHERE cedula_credito = $2
      RETURNING *;
      `,
      [nuevoEstatus, cedula_credito]
    );
    return resultado.rows[0];
  }
}

module.exports = Credito;