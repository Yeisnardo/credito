const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

// Validar los campos obligatorios de una persona
const validarPersona = (persona) => {
  const { cedula, nombre_completo, edad, tipo_persona, estado, municipio, direccion_actual } = persona;
  if (!cedula || !nombre_completo || edad == null || !tipo_persona || !estado || !municipio || !direccion_actual) {
    throw new Error("Campos obligatorios incompletos");
  }
};

// Obtener todas las personas
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM persona');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getPersonas:', err);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// Obtener una persona por cédula
router.get('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const resultado = await query('SELECT * FROM persona WHERE cedula = $1', [cedula]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getUnaPersona:', err);
    res.status(500).json({ error: 'Error al obtener la persona' });
  }
});

// Crear una nueva persona
router.post('/', async (req, res) => {
  try {
    const personaData = req.body;
    validarPersona(personaData);
    const { cedula, nombre_completo, edad, telefono, email, estado, municipio, direccion_actual, tipo_persona } = personaData;

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
      [cedula, nombre_completo, edad, telefono, email, estado, municipio, direccion_actual, tipo_persona]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createPersona:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una persona existente
router.put('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const personaData = req.body;
    validarPersona(personaData);

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
        personaData.nombre_completo,
        personaData.edad,
        personaData.telefono,
        personaData.email,
        personaData.estado,
        personaData.municipio,
        personaData.direccion_actual,
        personaData.tipo_persona,
        cedula
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updatePersona:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una persona por cédula
router.delete('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const resultado = await query('DELETE FROM persona WHERE cedula = $1 RETURNING *', [cedula]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    res.json({ message: 'Persona eliminada', persona: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deletePersona:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
