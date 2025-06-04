// models/clase_persona.js
const { query } = require('../config/db');

class Persona {
  // Validar los datos de una persona
  static validarPersona(persona) {
    const { cedula, nombre_completo, edad, tipo_persona } = persona;
    if (!cedula || !nombre_completo || edad == null || !tipo_persona) {
      throw new Error("Campos obligatorios incompletos");
    }
    // Validaciones adicionales pueden agregarse aquí
  }

  // Obtener todas las personas
  static async getPersona() {
    const resultado = await query('SELECT * FROM persona');
    return resultado.rows;
  }

  // Obtener una persona por cédula
  static async getUnaPersona(cedula) {
    const resultado = await query('SELECT * FROM persona WHERE cedula = $1', [cedula]);
    return resultado.rows[0];
  }

  // Crear una nueva persona
  static async createPersona(personaData) {
    this.validarPersona(personaData);
    const {
      cedula,
      nombre_completo,
      edad,
      telefono,
      email,
      tipo_persona
    } = personaData;

    const resultado = await query(
      `INSERT INTO persona 
        (cedula, nombre_completo, edad, telefono, email, tipo_persona)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cedula, nombre_completo, edad, telefono, email, tipo_persona]
    );
    return resultado.rows[0];
  }

  // Actualizar una persona por cédula
  static async updatePersona(cedula, personaData) {
    const { nombre_completo, edad, telefono, email, tipo_persona } = personaData;

    if (!nombre_completo || edad == null || !tipo_persona) {
      throw new Error('Campos obligatorios incompletos');
    }

    // La cédula puede cambiarse? Si no, no actualizarla, solo los otros campos
    const resultado = await query(
      `UPDATE persona SET 
        nombre_completo = $1,
        edad = $2,
        telefono = $3,
        email = $4,
        tipo_persona = $5
       WHERE cedula = $6
       RETURNING *`,
      [nombre_completo, edad, telefono, email, tipo_persona, cedula]
    );
    return resultado.rows[0];
  }

  // Eliminar una persona por cédula
  static async deletePersona(cedula) {
    const resultado = await query('DELETE FROM persona WHERE cedula = $1 RETURNING *', [cedula]);
    return resultado.rows[0];
  }
}

module.exports = Persona;