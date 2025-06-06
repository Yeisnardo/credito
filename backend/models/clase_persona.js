const { query } = require('../config/db');

class Persona {
  // Validar los campos obligatorios de una persona
  static validarPersona(persona) {
    const { cedula, nombre_completo, edad, tipo_persona, estado, municipio, direccion_actual } = persona;
    if (
      !cedula ||
      !nombre_completo ||
      edad == null ||
      !tipo_persona ||
      !estado ||
      !municipio ||
      !direccion_actual
    ) {
      throw new Error("Campos obligatorios incompletos");
    }
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
      estado,
      municipio,
      direccion_actual,
      tipo_persona
    } = personaData;

    const resultado = await query(
      `INSERT INTO persona (
        cedula,
        nombre_completo,
        edad,
        telefono,
        email,
        estado,
        municipio,
        direccion_actual,
        tipo_persona
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        cedula,
        nombre_completo,
        edad,
        telefono,
        email,
        estado,
        municipio,
        direccion_actual,
        tipo_persona
      ]
    );
    return resultado.rows[0];
  }

  // Actualizar una persona existente
  static async updatePersona(cedula, personaData) {
    const {
      nombre_completo,
      edad,
      telefono,
      email,
      estado,
      municipio,
      direccion_actual,
      tipo_persona
    } = personaData;

    if (
      !nombre_completo ||
      edad == null ||
      !tipo_persona ||
      !estado ||
      !municipio ||
      !direccion_actual
    ) {
      throw new Error('Campos obligatorios incompletos');
    }

    const resultado = await query(
      `UPDATE persona SET
        nombre_completo = $1,
        edad = $2,
        telefono = $3,
        email = $4,
        estado = $5,
        municipio = $6,
        direccion_actual = $7,
        tipo_persona = $8
       WHERE cedula = $9
       RETURNING *`,
      [
        nombre_completo,
        edad,
        telefono,
        email,
        estado,
        municipio,
        direccion_actual,
        tipo_persona,
        cedula
      ]
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