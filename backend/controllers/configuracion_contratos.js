const express = require('express');
const { query } = require('../config/conexion'); // Conexión a la base de datos

const router = express.Router();

// Obtener todas las configuraciones
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM configuracion_contratos');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getConfiguraciones:', err);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

// Crear una nueva configuración
router.post('/', async (req, res) => {
  try {
    const {
      moneda,
      porcentaje_flat,
      porcentaje_interes,
      porcentaje_mora,
      numero_cuotas,
      cuotasGracia,
      frecuencia_pago,
      dias_personalizados,
    } = req.body;

    const resultado = await query(
      `INSERT INTO configuracion_contratos (
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasGracia,
        frecuencia_pago,
        dias_personalizados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasGracia,
        frecuencia_pago,
        dias_personalizados,
      ]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createConfiguracion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una configuración existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      moneda,
      porcentaje_flat,
      porcentaje_interes,
      porcentaje_mora,
      numero_cuotas,
      cuotasGracia,
      frecuencia_pago,
      dias_personalizados,
    } = req.body;

    const resultado = await query(
      `UPDATE configuracion_contratos SET
        moneda = $1,
        porcentaje_flat = $2,
        porcentaje_interes = $3,
        porcentaje_mora = $4,
        numero_cuotas = $5,
        cuotasGracia = $6,
        frecuencia_pago = $7,
        dias_personalizados = $8,
        fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasGracia,
        frecuencia_pago,
        dias_personalizados,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en updateConfiguracion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una configuración por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await query('DELETE FROM configuracion_contratos WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json({ message: 'Configuración eliminada', configuracion: resultado.rows[0] });
  } catch (err) {
    console.error('Error en deleteConfiguracion:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;