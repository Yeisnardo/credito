// models/clase_ubicacion.js
const { query } = require('../config/db');

class Ubicacion {
  static validarUbicacion(ubicacion) {
    const { cedula_persona, estado, municipio, direccion_actual, emprendedor_id } = ubicacion;
    if (!cedula_persona || !estado || !municipio || !direccion_actual || !emprendedor_id) {
      throw new Error("Campos obligatorios incompletos");
    }
    // Validaciones adicionales si lo deseas
  }

  static async getUbicaciones() {
    const resultado = await query('SELECT * FROM ubicacion');
    return resultado.rows;
  }

  static async getUnaUbicacion(cedula_persona) {
    const resultado = await query('SELECT * FROM ubicacion WHERE cedula_persona = $1', [cedula_persona]);
    return resultado.rows[0];
  }

  static async createUbicacion(ubicacionData) {
    this.validarUbicacion(ubicacionData);
    const { cedula_persona, estado, municipio, direccion_actual, emprendedor_id } = ubicacionData;
    const resultado = await query(
      `INSERT INTO ubicacion (cedula_persona, estado, municipio, direccion_actual, emprendedor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cedula_persona, estado, municipio, direccion_actual, emprendedor_id]
    );
    return resultado.rows[0];
  }

  static async updateUbicacion(cedula_persona, ubicacionData) {
    const { estado, municipio, direccion_actual } = ubicacionData;
    if (!cedula_persona || !estado || !municipio || !direccion_actual) {
      throw new Error("Campos obligatorios incompletos");
    }
    const resultado = await query(
      `UPDATE ubicacion SET
        estado = $1,
        municipio = $2,
        direccion_actual = $3
       WHERE cedula_persona = $4
       RETURNING *`,
      [estado, municipio, direccion_actual, cedula_persona]
    );
    return resultado.rows[0];
  }

  static async deleteUbicacion(cedula_persona) {
    const resultado = await query('DELETE FROM ubicacion WHERE cedula_persona = $1 RETURNING *', [cedula_persona]);
    return resultado.rows[0];
  }
}

module.exports = Ubicacion;