const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Función de validación
const validarPersona = (personaData) => {
  const camposRequeridos = [
    'cedula', 
    'nombre_completo', 
    'telefono', 
    'email', 
    'estado', 
    'municipio', 
    'direccion_actual', 
    'tipo_persona'
  ];
  
  for (const campo of camposRequeridos) {
    if (!personaData[campo]) {
      throw new Error(`El campo ${campo} es obligatorio`);
    }
  }
};

const validarPersonaBasica = (personaData) => {
  const camposRequeridos = ['cedula', 'nombre_completo', 'telefono', 'email'];
  
  for (const campo of camposRequeridos) {
    if (!personaData[campo]) {
      throw new Error(`El campo ${campo} es obligatorio`);
    }
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
    console.error('Error en getPersona:', err);
    res.status(500).json({ error: 'Error al obtener la persona' });
  }
});

// Crear persona con campos básicos
router.post('/basica', async (req, res) => {
  try {
    const { cedula, nombre_completo, telefono, email } = req.body;

    validarPersonaBasica(req.body);

    const resultado = await query(
      `INSERT INTO persona (cedula, nombre_completo, telefono, email) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cedula, nombre_completo, telefono, email]
    );
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createPersonaBasica:', error);
    
    if (error.message.includes('obligatorio')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear una nueva persona (completa)
router.post('/', async (req, res) => {
  try {
    const personaData = req.body;
    validarPersona(personaData);
    
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
        cedula, nombre_completo, edad, telefono, email, 
        estado, municipio, direccion_actual, tipo_persona
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [cedula, nombre_completo, edad, telefono, email, estado, municipio, direccion_actual, tipo_persona]
    );
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createPersona:', error);
    
    if (error.message.includes('obligatorio')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
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
        nombre_completo = $1, edad = $2, telefono = $3, email = $4,
        estado = $5, municipio = $6, direccion_actual = $7, tipo_persona = $8
       WHERE cedula = $9 RETURNING *`,
      [
        personaData.nombre_completo, personaData.edad, personaData.telefono,
        personaData.email, personaData.estado, personaData.municipio,
        personaData.direccion_actual, personaData.tipo_persona, cedula
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updatePersona:', err);
    
    if (err.message.includes('obligatorio')) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;