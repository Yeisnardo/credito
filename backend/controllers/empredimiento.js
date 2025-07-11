const express = require('express');
const { query } = require('../config/db'); // Conexión a la base de datos

const router = express.Router();

// Crear un nuevo requerimiento
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const { cedula_requerimiento, opt_requerimiento } = data;

    const resultado = await query(
      `INSERT INTO requerimiento_emprendedor (
        cedula_requerimiento,
        opt_requerimiento
      ) VALUES ($1, $2) RETURNING *`,
      [cedula_requerimiento, opt_requerimiento]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en createRequerimientoEmprendedor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener requerimiento por id_req
router.get('/:id_req', async (req, res) => {
  try {
    const { id_req } = req.params;
    const resultado = await query(
      `SELECT 
       re.id_req,
       re.cedula_requerimiento,
       re.opt_requerimiento,
       s.cedula_solicitud,
       s.motivo,
       s.estatus
     FROM requerimiento_emprendedor re
     JOIN solicitud s ON re.cedula_requerimiento = s.cedula_solicitud
     WHERE re.id_req = $1`,
      [id_req]
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows[0]);
    } else {
      res.status(404).json({ message: 'Requerimiento no encontrado' });
    }
  } catch (error) {
    console.error('Error en getRequerimientoEmprendedor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
