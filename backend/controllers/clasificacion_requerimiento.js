const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

// Validar campos obligatorios
const validarRequerimiento = (requerimiento) => {
  const { nombre_requerimiento } = requerimiento;
  if (!nombre_requerimiento) {
    throw new Error("El campo 'nombre_requerimiento' es obligatorio");
  }
};

// Obtener todos los requerimientos
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM requerimientos');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getRequerimientos:', err);
    res.status(500).json({ error: 'Error al obtener requerimientos' });
  }
});

// Crear un nuevo requerimiento
router.post('/', async (req, res) => {
  try {
    const { nombre_requerimiento } = req.body;
    validarRequerimiento({ nombre_requerimiento });
    
    const resultado = await query(
      'INSERT INTO requerimientos (nombre_requerimiento) VALUES ($1) RETURNING *',
      [nombre_requerimiento]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createRequerimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un requerimiento por ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_requerimiento } = req.body;
    validarRequerimiento({ nombre_requerimiento });
    
    const resultado = await query(
      'UPDATE requerimientos SET nombre_requerimiento = $1 WHERE id_requerimientos = $2 RETURNING *',
      [nombre_requerimiento, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un requerimiento por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await query('DELETE FROM requerimientos WHERE id_requerimientos = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
    res.json({ message: 'Requerimiento eliminado', requerimiento: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deleteRequerimiento:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
