const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

// Validar los campos obligatorios de un emprendimiento
const validarEmprendimiento = (emprendimiento) => {
  const { cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento, consejo_nombre, comuna } = emprendimiento;
  if (!cedula_emprendedor || !tipo_sector || !tipo_negocio || !nombre_emprendimiento || !direccion_emprendimiento || !consejo_nombre || !comuna) {
    throw new Error("Campos obligatorios incompletos");
  }
};

// Obtener todos los emprendimientos
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM emprendimientos');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getEmprendimientos:', err);
    res.status(500).json({ error: 'Error al obtener emprendimientos' });
  }
});

// Obtener un emprendimiento por cédula del emprendedor
router.get('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query('SELECT * FROM emprendimientos WHERE cedula_emprendedor = $1', [cedula_emprendedor]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getUnaEmprendimiento:', err);
    res.status(500).json({ error: 'Error al obtener el emprendimiento' });
  }
});

// Crear un nuevo emprendimiento
router.post('/', async (req, res) => {
  try {
    const emprendimientoData = req.body;
    validarEmprendimiento(emprendimientoData);
    
    const { cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento, consejo_nombre, comuna } = emprendimientoData;

    const resultado = await query(
      `INSERT INTO emprendimientos (
        cedula_emprendedor,
        tipo_sector,
        tipo_negocio,
        nombre_emprendimiento,
        direccion_emprendimiento,
        consejo_nombre,
        comuna
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [cedula_emprendedor, tipo_sector, tipo_negocio, nombre_emprendimiento, direccion_emprendimiento, consejo_nombre, comuna]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createEmprendimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un emprendimiento existente
router.put('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const emprendimientoData = req.body;
    validarEmprendimiento(emprendimientoData);

    const resultado = await query(
      `UPDATE emprendimientos SET
        tipo_sector = $1,
        tipo_negocio = $2,
        nombre_emprendimiento = $3,
        direccion_emprendimiento = $4,
        consejo_nombre = $5,
        comuna = $6
       WHERE cedula_emprendedor = $7
       RETURNING *`,
      [
        emprendimientoData.tipo_sector,
        emprendimientoData.tipo_negocio,
        emprendimientoData.nombre_emprendimiento,
        emprendimientoData.direccion_emprendimiento,
        emprendimientoData.consejo_nombre,
        emprendimientoData.comuna,
        cedula_emprendedor
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateEmprendimiento:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un emprendimiento por cédula del emprendedor
router.delete('/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query('DELETE FROM emprendimientos WHERE cedula_emprendedor = $1 RETURNING *', [cedula_emprendedor]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Emprendimiento no encontrado' });
    }
    res.json({ message: 'Emprendimiento eliminado', emprendimiento: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deleteEmprendimiento:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
