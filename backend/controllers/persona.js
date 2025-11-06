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

// Actualizar una persona existente - VERSIÓN MEJORADA
router.put('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const personaData = req.body;
    
    // Validar que la persona exista
    const personaExistente = await query('SELECT * FROM persona WHERE cedula = $1', [cedula]);
    if (personaExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    // Construir la consulta dinámicamente para permitir actualizaciones parciales
    let queryParts = [];
    let queryParams = [];
    let paramCount = 1;

    const camposPermitidos = [
      'nombre_completo', 'edad', 'telefono', 'email', 
      'estado', 'municipio', 'direccion_actual', 'tipo_persona'
    ];

    camposPermitidos.forEach(campo => {
      if (personaData[campo] !== undefined) {
        queryParts.push(`${campo} = $${paramCount}`);
        queryParams.push(personaData[campo]);
        paramCount++;
      }
    });

    if (queryParts.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    queryParams.push(cedula);

    const queryString = `
      UPDATE persona 
      SET ${queryParts.join(', ')} 
      WHERE cedula = $${paramCount} 
      RETURNING *
    `;

    const resultado = await query(queryString, queryParams);
    
    res.json({
      message: 'Persona actualizada correctamente',
      persona: resultado.rows[0]
    });
    
  } catch (err) {
    console.error('Error en updatePersona:', err);
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