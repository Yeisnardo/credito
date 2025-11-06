const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

// Obtener todos los registros de bitácora con filtros y paginación
router.get('/', async (req, res) => {
  try {
    const { 
      limite = 100, 
      offset = 0, 
      accion, 
      cedula_usuario,
      fecha_desde,
      fecha_hasta 
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    // Filtros opcionales
    if (accion) {
      whereConditions.push(`accion ILIKE $${paramCount}`);
      queryParams.push(`%${accion}%`);
      paramCount++;
    }

    if (cedula_usuario) {
      whereConditions.push(`cedula_usuario = $${paramCount}`);
      queryParams.push(cedula_usuario);
      paramCount++;
    }

    if (fecha_desde) {
      whereConditions.push(`fecha >= $${paramCount}`);
      queryParams.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      whereConditions.push(`fecha <= $${paramCount}`);
      queryParams.push(fecha_hasta);
      paramCount++;
    }

    // Construir la consulta WHERE
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Agregar parámetros de paginación
    queryParams.push(parseInt(limite));
    queryParams.push(parseInt(offset));

    const queryString = `
      SELECT 
        b.*,
        p.nombre_completo,
        u.rol
      FROM bitacora b
      LEFT JOIN persona p ON b.cedula_usuario = p.cedula
      LEFT JOIN usuario u ON b.cedula_usuario = u.cedula_usuario
      ${whereClause}
      ORDER BY b.fecha DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const resultado = await query(queryString, queryParams);
    
    // Obtener el total de registros para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bitacora b
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, whereConditions.length > 0 ? queryParams.slice(0, -2) : []);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      registros: resultado.rows,
      paginacion: {
        total,
        limite: parseInt(limite),
        offset: parseInt(offset),
        paginas: Math.ceil(total / limite)
      }
    });
  } catch (err) {
    console.error('Error en getBitacora:', err);
    res.status(500).json({ message: 'Error al obtener registros de bitácora' });
  }
});

// Obtener estadísticas de la bitácora
router.get('/estadisticas', async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (fecha_desde) {
      whereConditions.push(`fecha >= $${paramCount}`);
      queryParams.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      whereConditions.push(`fecha <= $${paramCount}`);
      queryParams.push(fecha_hasta);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Consulta para estadísticas por acción
    const statsQuery = `
      SELECT 
        accion,
        COUNT(*) as cantidad,
        COUNT(DISTINCT cedula_usuario) as usuarios_unicos
      FROM bitacora
      ${whereClause}
      GROUP BY accion
      ORDER BY cantidad DESC
    `;

    const statsResult = await query(statsQuery, queryParams);

    // Consulta para actividad por día
    const dailyActivityQuery = `
      SELECT 
        DATE(fecha) as fecha,
        COUNT(*) as actividades
      FROM bitacora
      ${whereClause}
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
      LIMIT 30
    `;

    const dailyResult = await query(dailyActivityQuery, queryParams);

    res.json({
      estadisticas: statsResult.rows,
      actividad_diaria: dailyResult.rows,
      total_registros: statsResult.rows.reduce((sum, item) => sum + parseInt(item.cantidad), 0)
    });
  } catch (err) {
    console.error('Error en getEstadisticasBitacora:', err);
    res.status(500).json({ message: 'Error al obtener estadísticas de bitácora' });
  }
});

module.exports = router;