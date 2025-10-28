const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Obtener todas las configuraciones
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM configuracion_contratos ORDER BY fecha_creacion DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getConfiguraciones:', err);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

// Obtener configuración activa (la más reciente)
router.get('/activa', async (req, res) => {
  try {
    const resultado = await query(
      'SELECT * FROM configuracion_contratos ORDER BY fecha_creacion DESC LIMIT 1'
    );
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'No hay configuraciones activas' });
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getConfiguracionActiva:', err);
    res.status(500).json({ error: 'Error al obtener configuración activa' });
  }
});

// Obtener todas las configuraciones (alias)
router.get('/todas', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM configuracion_contratos ORDER BY fecha_creacion DESC');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getAllConfiguraciones:', err);
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
      cuotasgracias,
      frecuencia_pago,
      dias_personalizados,
    } = req.body;

    // 1. Insertar en configuracion_contratos
    const resultado = await query(
      `INSERT INTO configuracion_contratos (
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasgracias,
        frecuencia_pago,
        dias_personalizados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasgracias,
        frecuencia_pago,
        dias_personalizados,
      ]
    );

    const nuevaConfiguracion = resultado.rows[0];

    // 2. Registrar en el historial
    await query(
      `INSERT INTO historial_configuracion_contratos (
        configuracion_id,
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasgracias,
        frecuencia_pago,
        dias_personalizados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        nuevaConfiguracion.id,
        moneda,
        parseFloat(porcentaje_flat) || 0,
        parseFloat(porcentaje_interes) || 0,
        parseFloat(porcentaje_mora) || 0,
        parseInt(numero_cuotas) || 0,
        cuotasgracias ? parseInt(cuotasgracias) : 0,
        frecuencia_pago,
        dias_personalizados ? parseInt(dias_personalizados) : null
      ]
    );

    res.status(201).json({
      message: 'Configuración creada y registrada en historial',
      configuracion: nuevaConfiguracion
    });
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
      cuotasgracias,
      frecuencia_pago,
      dias_personalizados,
    } = req.body;

    // 1. Actualizar configuración
    const resultado = await query(
      `UPDATE configuracion_contratos SET
        moneda = $1,
        porcentaje_flat = $2,
        porcentaje_interes = $3,
        porcentaje_mora = $4,
        numero_cuotas = $5,
        cuotasgracias = $6,
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
        cuotasgracias,
        frecuencia_pago,
        dias_personalizados,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    const configuracionActualizada = resultado.rows[0];

    // 2. Registrar en el historial
    await query(
      `INSERT INTO historial_configuracion_contratos (
        configuracion_id,
        moneda,
        porcentaje_flat,
        porcentaje_interes,
        porcentaje_mora,
        numero_cuotas,
        cuotasgracias,
        frecuencia_pago,
        dias_personalizados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        moneda,
        parseFloat(porcentaje_flat) || 0,
        parseFloat(porcentaje_interes) || 0,
        parseFloat(porcentaje_mora) || 0,
        parseInt(numero_cuotas) || 0,
        cuotasgracias ? parseInt(cuotasgracias) : 0,
        frecuencia_pago,
        dias_personalizados ? parseInt(dias_personalizados) : null
      ]
    );

    res.json({
      message: 'Configuración actualizada y registrada en historial',
      configuracion: configuracionActualizada
    });
  } catch (err) {
    console.error('Error en updateConfiguracion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una configuración por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Verificar si existe
    const configExistente = await query('SELECT * FROM configuracion_contratos WHERE id = $1', [id]);
    if (configExistente.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    // 2. Eliminar configuración
    const resultado = await query('DELETE FROM configuracion_contratos WHERE id = $1 RETURNING *', [id]);
    
    res.json({ 
      message: 'Configuración eliminada exitosamente', 
      configuracion: resultado.rows[0] 
    });
  } catch (err) {
    console.error('Error en deleteConfiguracion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial de configuraciones
router.get('/historial', async (req, res) => {
  try {
    const resultado = await query(
      `SELECT 
        h.*,
        c.fecha_creacion,
        c.fecha_actualizacion
       FROM historial_configuracion_contratos h
       LEFT JOIN configuracion_contratos c ON h.configuracion_id = c.id
       ORDER BY h.fecha_cambio DESC`
    );
    
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getHistorialConfiguracion:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener configuración por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await query('SELECT * FROM configuracion_contratos WHERE id = $1', [id]);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en getConfiguracionById:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;