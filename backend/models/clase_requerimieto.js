const { query } = require('../config/db');

class Requerimiento {
  static validarRequerimiento(requerimiento) {
    const {
      cedula_requerimiento,
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
    } = requerimiento;

    if (
      !cedula_requerimiento ||
      !carta_solicitud ||
      !postulacion_UBCH ||
      !certificado_emprender ||
      !registro_municipal ||
      !carta_residencia ||
      !copia_cedula ||
      !rif_personal ||
      !fotos_emprendimiento ||
      !rif_emprendimiento ||
      !referencia_bancaria
    ) {
      throw new Error("Campos obligatorios incompletos");
    }
  }

  static async getRequerimientos() {
    const resultado = await query('SELECT * FROM requerimientos');
    return resultado.rows;
  }

  static async getUnaRequerimiento(cedula_requerimiento) {
    const resultado = await query(
      'SELECT * FROM requerimientos WHERE cedula_requerimiento = $1',
      [cedula_requerimiento]
    );
    return resultado.rows[0];
  }

  static async createRequerimiento(requerimientoData) {
    this.validarRequerimiento(requerimientoData);
    const {
      cedula_requerimiento,
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
    } = requerimientoData;

    const resultado = await query(
      `INSERT INTO requerimientos (
        cedula_requerimiento,
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
      [
        cedula_requerimiento,
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

  static async updateRequerimiento(cedula_requerimiento, requerimientoData) {
    this.validarRequerimiento(requerimientoData);
    const {
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
    } = requerimientoData;

    const resultado = await query(
      `UPDATE requerimientos SET
        carta_solicitud = $1,
        postulacion_UBCH = $2,
        certificado_emprender = $3,
        registro_municipal = $4,
        carta_residencia = $5,
        copia_cedula = $6,
        rif_personal = $7,
        fotos_emprendimiento = $8,
        rif_emprendimiento = $9,
        referencia_bancaria = $10
       WHERE cedula_requerimiento = $11
       RETURNING *`,
      [
        carta_solicitud,
        postulacion_UBCH,
        certificado_emprender,
        registro_municipal,
        carta_residencia,
        copia_cedula,
        rif_personal,
        fotos_emprendimiento,
        rif_emprendimiento,
        referencia_bancaria,
        cedula_requerimiento
      ]
    );
    return resultado.rows[0];
  }

  static async deleteRequerimiento(cedula_requerimiento) {
    const resultado = await query(
      'DELETE FROM requerimientos WHERE cedula_requerimiento = $1 RETURNING *',
      [cedula_requerimiento]
    );
    return resultado.rows[0];
  }
}

module.exports = Requerimiento;