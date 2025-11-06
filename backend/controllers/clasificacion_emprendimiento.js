const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

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
    const { sector, negocio } = req.body;
    
    if (!sector) {
      return res.status(400).json({ error: 'El sector es obligatorio' });
    }

    const resultado = await query(
      'INSERT INTO clasificacion (sector, negocio) VALUES ($1, $2) RETURNING *',
      [sector, negocio]
    );
    
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createClasificacion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar una clasificación
router.put('/:id_clasificacion', async (req, res) => {
  try {
    const { id_clasificacion } = req.params;
    const { sector, negocio } = req.body;
    
    if (!sector) {
      return res.status(400).json({ error: 'El sector es obligatorio' });
    }

    const resultado = await query(
      'UPDATE clasificacion SET sector = $1, negocio = $2 WHERE id_clasificacion = $3 RETURNING *',
      [sector, negocio, id_clasificacion]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateClasificacion:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar una clasificación
router.delete('/:id_clasificacion', async (req, res) => {
  try {
    const { id_clasificacion } = req.params;
    const resultado = await query('DELETE FROM clasificacion WHERE id_clasificacion = $1 RETURNING *', [id_clasificacion]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Clasificación no encontrada' });
    }
    
    res.json({ message: 'Clasificación eliminada', clasificacion: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deleteClasificacion:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;