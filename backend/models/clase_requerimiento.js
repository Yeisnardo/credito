const { query } = require('../config/db'); // Ajusta la ruta según tu estructura

class Requerimiento {
  static async createRequerimiento(data) {
    const {
      cedula_requerimiento,
      fecha,
      carta_solicitud,
      postulacion_UBCH,
      certificado_emprender,
      registro_municipal,
      carta_residencia,
      copia_cedula,
      rif_personal,
      fotos_emprendimiento,
      rif_emprendimiento,
      referencia_bancaria
    } = data;

    const resultado = await query(
      `INSERT INTO requerimientos (
        cedula_requerimiento,
        fecha,
        carta_solicitud,
        postulacion_UBCH,
        certificado_emprender,
        registro_municipal,
        carta_residencia,
        copia_cedula,
        rif_personal,
        fotos_emprendimiento,
        rif_emprendimiento,
        referencia_bancaria
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        cedula_requerimiento,
        fecha,
        carta_solicitud,
        postulacion_UBCH,
        certificado_emprender,
        registro_municipal,
        carta_residencia,
        copia_cedula,
        rif_personal,
        fotos_emprendimiento,
        rif_emprendimiento,
        referencia_bancaria
      ]
    );
    return resultado.rows[0];
  }

  // Nuevo método para obtener por cédula
  static async getRequerimientoByCedula(cedula_requerimiento) {
    const resultado = await query(
      `SELECT * FROM requerimientos WHERE cedula_requerimiento = $1`,
      [cedula_requerimiento]
    );
    return resultado.rows[0]; // Devuelve el primer resultado o undefined si no existe
  }
}

module.exports = Requerimiento;