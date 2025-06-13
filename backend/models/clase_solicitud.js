const { query } = require('../config/db');

class Solicitud {
  // Validar campos obligatorios, incluyendo estatus si es obligatorio al crear
  static validarSolicitud(solicitud) {
    const { cedula_solicitud, motivo, estatus } = solicitud;
    if (!cedula_solicitud || !motivo) {
      throw new Error('Campos obligatorios incompletos');
    }
    // Si estatus es obligatorio en creación, descomenta la siguiente línea
    // if (!estatus) throw new Error('El estatus es obligatorio');
  }

  // Obtener todas las solicitudes
  static async getSolicitudes() {
    const resultado = await query(`
      SELECT cedula_solicitud, motivo, estatus
      FROM solicitud
    `);
    return resultado.rows;
  }

  // Obtener una solicitud por cedula_solicitud
  static async getSolicitudPorCedula(cedula_solicitud) {
    const resultado = await query(
      `SELECT cedula_solicitud, motivo, estatus FROM solicitud WHERE cedula_solicitud = $1`,
      [cedula_solicitud]
    );
    if (resultado.rows.length === 0) return null;
    return resultado.rows[0];
  }

  // Crear una nueva solicitud
  static async createSolicitud(solicitudData) {
    this.validarSolicitud(solicitudData);
    const { cedula_solicitud, motivo, estatus } = solicitudData;

    // Puedes establecer un valor predeterminado para estatus si no se proporciona
    const estatusValor = estatus || 'pendiente'; // ejemplo: 'pendiente'

    const resultado = await query(
      `
      INSERT INTO solicitud (cedula_solicitud, motivo, estatus)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [cedula_solicitud, motivo, estatusValor]
    );
    return resultado.rows[0];
  }

  // Actualizar una solicitud (incluye estatus si se desea)
  static async updateSolicitud(cedula_solicitud, solicitudData) {
    const { motivo, estatus } = solicitudData;
    if (!motivo && !estatus) {
      throw new Error('Debe proporcionar al menos motivo o estatus para actualizar');
    }

    // Construir dinámicamente la consulta para actualizar solo los campos proporcionados
    const fields = [];
    const values = [];
    let index = 1;

    if (motivo !== undefined) {
      fields.push(`motivo = $${index++}`);
      values.push(motivo);
    }

    if (estatus !== undefined) {
      fields.push(`estatus = $${index++}`);
      values.push(estatus);
    }

    values.push(cedula_solicitud); // para la cláusula WHERE

    const resultado = await query(
      `
      UPDATE solicitud SET ${fields.join(', ')}
      WHERE cedula_solicitud = $${index}
      RETURNING *
      `,
      [...values, cedula_solicitud]
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