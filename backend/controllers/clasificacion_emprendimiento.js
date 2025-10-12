const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Validar los campos obligatorios
const validarClasificacion = (clasificacion) => {
  const { sector } = clasificacion;
  if (!sector) {
    throw new Error("El campo 'sector' es obligatorio");
  }
};

// Obtener todas las clasificaciones
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM clasificacion ORDER BY sector, negocio');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getClasificaciones:', err);
    res.status(500).json({ error: 'Error al obtener clasificaciones' });
  }
});

// Crear una nueva clasificación
router.post('/', async (req, res) => {
  try {
    const clasificacionData = req.body;
    validarClasificacion(clasificacionData);
    
    const { sector, negocio } = clasificacionData;

    const resultado = await query(
      `INSERT INTO clasificacion (sector, negocio) VALUES ($1, $2) RETURNING *`,
      [sector, negocio || null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en createClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar una clasificación por ID
router.put('/:id_clasificacion', async (req, res) => {
  try {
    const { id_clasificacion } = req.params;
    const clasificacionData = req.body;
    validarClasificacion(clasificacionData);

    const { sector, negocio } = clasificacionData;

    const resultado = await query(
      `UPDATE clasificacion SET sector = $1, negocio = $2 WHERE id_clasificacion = $3 RETURNING *`,
      [sector, negocio || null, id_clasificacion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una clasificación por ID
router.delete('/:id_clasificacion', async (req, res) => {
  try {
    const { id_clasificacion } = req.params;

    const resultado = await query(
      'DELETE FROM clasificacion WHERE id_clasificacion = $1 RETURNING *',
      [id_clasificacion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    res.json({ message: 'Clasificación eliminada correctamente' });
  } catch (err) {
    console.error('Error en deleteClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener clasificación por ID
router.get('/:id_clasificacion', async (req, res) => {
  try {
    const { id_clasificacion } = req.params;

    const resultado = await query(
      'SELECT * FROM clasificacion WHERE id_clasificacion = $1',
      [id_clasificacion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getClasificacion:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;