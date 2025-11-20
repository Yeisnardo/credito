const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

let lastId = 0;

async function initializeLastId() {
  try {
    const res = await query('SELECT MAX(id_contrato) AS max_id FROM contrato');
    lastId = res.rows[0].max_id !== null ? parseInt(res.rows[0].max_id, 10) : 0;
  } catch (err) {
    console.error('Error al obtener el max id_contrato:', err);
    lastId = 0;
  }
}

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

// Ruta para insertar en la tabla 'contrato' (ACTUALIZADA CON monto_bs_neto y monto_restado)
router.post('/contrato', async (req, res) => {
  try {
    let {
      numero_contrato,
      cedula_emprendedor,
      monto_aprob_euro,
      monto_bs,
      monto_bs_neto,
      monto_restado, // CAMBIO: cincoflat por monto_restado
      diezinteres,
      monto_devolver,
      monto_semanal,
      monto_cuota,
      frecuencia_pago_contrato,
      cuotas,
      gracia,
      interes,
      morosidad,
      dias_personalizados,
      fecha_desde,
      fecha_hasta,
      estatus
    } = req.body;

    // Validar fechas
    fecha_desde = fecha_desde && fecha_desde.trim() !== '' ? fecha_desde : null;
    fecha_hasta = fecha_hasta && fecha_hasta.trim() !== '' ? fecha_hasta : null;

    // Validar y limpiar campos opcionales
    dias_personalizados = dias_personalizados && dias_personalizados.trim() !== '' 
      ? dias_personalizados.trim() 
      : null;

    monto_cuota = monto_cuota && monto_cuota.trim() !== '' ? monto_cuota : null;
    cuotas = cuotas && cuotas.trim() !== '' ? cuotas : null;
    gracia = gracia && gracia.trim() !== '' ? gracia : null;
    interes = interes && interes.trim() !== '' ? interes : null;
    morosidad = morosidad && morosidad.trim() !== '' ? morosidad : null;

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
        monto_bs_neto,
        monto_restado,
        diezinteres,
        monto_devolver,
        monto_semanal,
        monto_cuota,
        frecuencia_pago_contrato,
        cuotas,
        gracia,
        interes,
        morosidad,
        dias_personalizados,
        fecha_desde,
        fecha_hasta,
        estatus
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        monto_aprob_euro,
        monto_bs,
        monto_bs_neto,
        monto_restado, // CAMBIO: cincoflat por monto_restado
        diezinteres,
        monto_devolver,
        monto_semanal,
        monto_cuota,
        frecuencia_pago_contrato,
        cuotas,
        gracia,
        interes,
        morosidad,
        dias_personalizados,
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

// Ruta para obtener todos los contratos
router.get('/', async (req, res) => {
  try {
    const resultado = await query(
      `SELECT * FROM contrato ORDER BY id_contrato DESC`
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

// Ruta para actualizar un contrato (ACTUALIZADA CON monto_restado)
router.put('/:id_contrato', async (req, res) => {
  const { id_contrato } = req.params;
  
  try {
    let {
      monto_aprob_euro,
      monto_bs,
      monto_bs_neto, // NUEVO: agregar monto_bs_neto
      monto_restado, // CAMBIO: cincoflat por monto_restado
      diezinteres,
      monto_devolver,
      monto_semanal,
      monto_cuota,
      frecuencia_pago_contrato,
      cuotas,
      gracia,
      interes,
      morosidad,
      dias_personalizados,
      fecha_desde,
      fecha_hasta,
      estatus
    } = req.body;

    // Validar y limpiar campos
    fecha_desde = fecha_desde && fecha_desde.trim() !== '' ? fecha_desde : null;
    fecha_hasta = fecha_hasta && fecha_hasta.trim() !== '' ? fecha_hasta : null;
    dias_personalizados = dias_personalizados && dias_personalizados.trim() !== '' 
      ? dias_personalizados.trim() 
      : null;

    const resultado = await query(
      `UPDATE contrato SET 
        monto_aprob_euro = $1,
        monto_bs = $2,
        monto_bs_neto = $3, // NUEVO: agregar monto_bs_neto
        monto_restado = $4, // CAMBIO: cincoflat por monto_restado
        diezinteres = $5,
        monto_devolver = $6,
        monto_semanal = $7,
        monto_cuota = $8,
        frecuencia_pago_contrato = $9,
        cuotas = $10,
        gracia = $11,
        interes = $12,
        morosidad = $13,
        dias_personalizados = $14,
        fecha_desde = $15,
        fecha_hasta = $16,
        estatus = $17
      WHERE id_contrato = $18
      RETURNING *`,
      [
        monto_aprob_euro,
        monto_bs,
        monto_bs_neto, // NUEVO: agregar monto_bs_neto
        monto_restado, // CAMBIO: cincoflat por monto_restado
        diezinteres,
        monto_devolver,
        monto_semanal,
        monto_cuota,
        frecuencia_pago_contrato,
        cuotas,
        gracia,
        interes,
        morosidad,
        dias_personalizados,
        fecha_desde,
        fecha_hasta,
        estatus,
        id_contrato
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    res.status(200).json({
      message: 'Contrato actualizado correctamente',
      contrato: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar el contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;