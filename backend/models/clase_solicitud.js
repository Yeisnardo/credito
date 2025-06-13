const { query } = require('../config/db');

class Solicitud {
  // Validar campos obligatorios
  static validarSolicitud(solicitud) {
    const { cedula_solicitud, motivo } = solicitud;
    if (!cedula_solicitud || !motivo) {
      throw new Error('Campos obligatorios incompletos');
    }
  }

  // Obtener todas las solicitudes
  static async getSolicitudes() {
    const resultado = await query(`
      SELECT cedula_solicitud, motivo
      FROM solicitud
    `);
    return resultado.rows;
  }

  // Obtener una solicitud por cedula_solicitud
  static async getSolicitudPorCedula(cedula_solicitud) {
    const resultado = await query(
      `SELECT cedula_solicitud, motivo FROM solicitud WHERE cedula_solicitud = $1`,
      [cedula_solicitud]
    );
    if (resultado.rows.length === 0) return null;
    return resultado.rows[0];
  }

  // Crear una nueva solicitud
  static async createSolicitud(solicitudData) {
    this.validarSolicitud(solicitudData);
    const { cedula_solicitud, motivo } = solicitudData;

    const resultado = await query(
      `
      INSERT INTO solicitud (cedula_solicitud, motivo)
      VALUES ($1, $2)
      RETURNING *
      `,
      [cedula_solicitud, motivo]
    );
    return resultado.rows[0];
  }

  // Actualizar una solicitud
  static async updateSolicitud(cedula_solicitud, solicitudData) {
    const { motivo } = solicitudData;
    if (!motivo) {
      throw new Error('El motivo es obligatorio');
    }

    const resultado = await query(
      `
      UPDATE solicitud SET motivo = $1
      WHERE cedula_solicitud = $2
      RETURNING *
      `,
      [motivo, cedula_solicitud]
    );
    return resultado.rows[0];
  }

  // Eliminar una solicitud
  static async deleteSolicitud(cedula_solicitud) {
    const resultado = await query(
      `DELETE FROM solicitud WHERE cedula_solicitud = $1 RETURNING *`,
      [cedula_solicitud]
    );
    return resultado.rows[0]; // null si no existe
  }
}

module.exports = Solicitud;