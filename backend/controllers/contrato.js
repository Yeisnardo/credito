const express = require('express');
const { query } = require('../config/conexion'); // Tu configuración de conexión a la base de datos

const router = express.Router();

let lastId = 0; // Variable para mantener el último ID utilizado

// Función para inicializar lastId con el valor máximo en la base de datos
async function initializeLastId() {
  try {
    const res = await query('SELECT MAX(id_contrato) AS max_id FROM contrato');
    lastId = res.rows[0].max_id !== null ? parseInt(res.rows[0].max_id, 10) : 0;
  } catch (err) {
    console.error('Error al obtener el max id_contrato:', err);
    lastId = 0; // en caso de error, empieza en 0
  }
}

// Ejecutar la inicialización al arrancar
initializeLastId();


// Ruta para insertar en n_contrato
router.post('/', async (req, res) => {
  try {
    const { cedula_emprendedor, numero_contrato } = req.body;

    const resultado = await query(
      `INSERT INTO n_contrato (cedula_emprendedor, numero_contrato)
       VALUES ($1, $2)
       RETURNING *`,
      [cedula_emprendedor, numero_contrato]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al registrar en n_contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para insertar en la tabla 'contrato'
router.post('/contrato', async (req, res) => {
  try {
    let {
      numero_contrato,
      cedula_emprendedor,
      monto_aprob_euro,
      monto_bs,
      cincoflat,
      diezinteres,
      monto_devolver,
      fecha_desde,
      fecha_hasta,
      estatus
    } = req.body;

    // Validar fechas
    fecha_desde = fecha_desde && fecha_desde.trim() !== '' ? fecha_desde : null;
    fecha_hasta = fecha_hasta && fecha_hasta.trim() !== '' ? fecha_hasta : null;

    // Incrementar el ID manualmente
    lastId += 1;
    const id_contrato = lastId;

    const resultado = await query(
      `INSERT INTO contrato (
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        monto_aprob_euro,
        monto_bs,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        estatus
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        monto_aprob_euro,
        monto_bs,
        cincoflat,
        diezinteres,
        monto_devolver,
        fecha_desde,
        fecha_hasta,
        estatus
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al registrar en contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener contratos por cédula del emprendedor
router.get('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;

    const resultado = await query(
      `SELECT * FROM contrato WHERE cedula_emprendedor = $1`,
      [cedula]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para aceptar un contrato
router.post('/:id_contrato', async (req, res) => {
  const { id_contrato } = req.params;
  
  try {
    // Actualiza el estado del contrato a 'aceptado' o el valor que uses
    const resultado = await query(
      `UPDATE contrato SET estatus = $1 WHERE id_contrato = $2 RETURNING *`,
      ['aceptado', id_contrato]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    res.status(200).json({
      message: 'Contrato aceptado correctamente',
      contrato: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al aceptar el contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;