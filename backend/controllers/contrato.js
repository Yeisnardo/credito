const express = require('express');
const { query } = require('../config/conexion');

const router = express.Router();

let lastId = 0;

// Función para registrar en bitácora
const registrarBitacora = async (accion, cedula_usuario, detalles = {}) => {
  try {
    await query(
      `INSERT INTO bitacora (accion, cedula_usuario, detalles) 
       VALUES ($1, $2, $3)`,
      [accion, cedula_usuario, JSON.stringify(detalles)]
    );
  } catch (error) {
    console.error('Error al registrar en bitácora:', error);
  }
};

// Función para obtener cédula del usuario desde el token (adaptar según tu auth)
const obtenerUsuarioActual = (req) => {
  return req.user?.cedula || req.headers['user-cedula'] || 'sistema';
};

// Middleware para log de operaciones
const logOperacion = (accion) => {
  return (req, res, next) => {
    console.log(`${accion} - ${req.method} ${req.originalUrl}`);
    next();
  };
};

async function initializeLastId() {
  try {
    const res = await query('SELECT MAX(id_contrato) AS max_id FROM contrato');
    lastId = res.rows[0].max_id !== null ? parseInt(res.rows[0].max_id, 10) : 0;
    
    await registrarBitacora(
      'INICIALIZACION_IDS_CONTRATO',
      'sistema',
      { ultimo_id: lastId }
    );
  } catch (err) {
    console.error('Error al obtener el max id_contrato:', err);
    lastId = 0;
  }
}

initializeLastId();

// Ruta para insertar en n_contrato
router.post('/', logOperacion('CREAR_NUMERO_CONTRATO'), async (req, res) => {
  try {
    const { cedula_emprendedor, numero_contrato } = req.body;

    // Verificar si ya existe un número de contrato para este emprendedor
    const contratoExistente = await query(
      'SELECT * FROM n_contrato WHERE cedula_emprendedor = $1',
      [cedula_emprendedor]
    );

    if (contratoExistente.rows.length > 0) {
      await registrarBitacora(
        'INTENTO_CREAR_NUMERO_CONTRATO_EXISTENTE',
        obtenerUsuarioActual(req),
        { cedula_emprendedor }
      );

      return res.status(409).json({ 
        error: 'Ya existe un número de contrato para este emprendedor' 
      });
    }

    const resultado = await query(
      `INSERT INTO n_contrato (cedula_emprendedor, numero_contrato)
       VALUES ($1, $2)
       RETURNING *`,
      [cedula_emprendedor, numero_contrato]
    );

    const nuevoNumeroContrato = resultado.rows[0];

    // Registrar en bitácora
    await registrarBitacora(
      'CREACION_NUMERO_CONTRATO_EXITOSA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor,
        numero_contrato,
        id_registro: nuevoNumeroContrato.id // asumiendo que hay un campo id
      }
    );

    res.status(201).json(nuevoNumeroContrato);
  } catch (error) {
    console.error('Error al registrar en n_contrato:', error);
    
    await registrarBitacora(
      'ERROR_CREACION_NUMERO_CONTRATO',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor: req.body.cedula_emprendedor,
        numero_contrato: req.body.numero_contrato,
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para insertar en la tabla 'contrato' (ACTUALIZADA CON monto_bs_neto y monto_restado)
router.post('/contrato', logOperacion('CREAR_CONTRATO'), async (req, res) => {
  try {
    let {
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
    } = req.body;

    // Validar campos obligatorios
    if (!numero_contrato || !cedula_emprendedor) {
      await registrarBitacora(
        'ERROR_VALIDACION_CONTRATO',
        obtenerUsuarioActual(req),
        {
          campos_faltantes: {
            numero_contrato: !numero_contrato,
            cedula_emprendedor: !cedula_emprendedor
          }
        }
      );

      return res.status(400).json({ error: 'Número de contrato y cédula son obligatorios' });
    }

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

    // Verificar si ya existe un contrato con este número
    const contratoExistente = await query(
      'SELECT * FROM contrato WHERE numero_contrato = $1',
      [numero_contrato]
    );

    if (contratoExistente.rows.length > 0) {
      await registrarBitacora(
        'INTENTO_CREAR_CONTRATO_EXISTENTE',
        obtenerUsuarioActual(req),
        { numero_contrato }
      );

      return res.status(409).json({ 
        error: 'Ya existe un contrato con este número' 
      });
    }

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
      ]
    );

    const nuevoContrato = resultado.rows[0];

    // Registrar creación exitosa en bitácora
    await registrarBitacora(
      'CREACION_CONTRATO_EXITOSA',
      obtenerUsuarioActual(req),
      {
        id_contrato,
        numero_contrato,
        cedula_emprendedor,
        montos: {
          monto_aprob_euro,
          monto_bs,
          monto_bs_neto,
          monto_restado,
          monto_devolver
        },
        terminos: {
          cuotas,
          interes,
          frecuencia_pago_contrato,
          gracia
        },
        fechas: {
          fecha_desde,
          fecha_hasta
        },
        estatus
      }
    );

    res.status(201).json(nuevoContrato);
  } catch (error) {
    console.error('Error al registrar en contrato:', error);
    
    await registrarBitacora(
      'ERROR_CREACION_CONTRATO',
      obtenerUsuarioActual(req),
      {
        datos_recibidos: {
          numero_contrato: req.body.numero_contrato,
          cedula_emprendedor: req.body.cedula_emprendedor,
          monto_aprob_euro: req.body.monto_aprob_euro,
          monto_bs: req.body.monto_bs
        },
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener contratos por cédula del emprendedor
router.get('/:cedula', logOperacion('CONSULTAR_CONTRATOS_CEDULA'), async (req, res) => {
  try {
    const { cedula } = req.params;

    const resultado = await query(
      `SELECT * FROM contrato WHERE cedula_emprendedor = $1 ORDER BY id_contrato DESC`,
      [cedula]
    );

    // Registrar consulta en bitácora
    await registrarBitacora(
      'CONSULTA_CONTRATOS_POR_CEDULA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor: cedula,
        total_contratos: resultado.rows.length,
        contratos_encontrados: resultado.rows.length > 0
      }
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    
    await registrarBitacora(
      'ERROR_CONSULTA_CONTRATOS_CEDULA',
      obtenerUsuarioActual(req),
      {
        cedula_emprendedor: req.params.cedula,
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todos los contratos
router.get('/', logOperacion('CONSULTAR_TODOS_CONTRATOS'), async (req, res) => {
  try {
    const resultado = await query(
      `SELECT * FROM contrato ORDER BY id_contrato DESC`
    );

    // Registrar consulta en bitácora
    await registrarBitacora(
      'CONSULTA_TODOS_CONTRATOS',
      obtenerUsuarioActual(req),
      {
        total_contratos: resultado.rows.length,
        filtros_aplicados: req.query
      }
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    
    await registrarBitacora(
      'ERROR_CONSULTA_TODOS_CONTRATOS',
      obtenerUsuarioActual(req),
      {
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para aceptar un contrato
router.post('/:id_contrato/aceptar', logOperacion('ACEPTAR_CONTRATO'), async (req, res) => {
  const { id_contrato } = req.params;
  
  try {
    // Obtener contrato actual para la bitácora
    const contratoActual = await query(
      'SELECT * FROM contrato WHERE id_contrato = $1',
      [id_contrato]
    );

    if (contratoActual.rows.length === 0) {
      await registrarBitacora(
        'INTENTO_ACEPTAR_CONTRATO_NO_EXISTENTE',
        obtenerUsuarioActual(req),
        { id_contrato }
      );

      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const resultado = await query(
      `UPDATE contrato SET estatus = $1 WHERE id_contrato = $2 RETURNING *`,
      ['aceptado', id_contrato]
    );

    const contratoAceptado = resultado.rows[0];

    // Registrar aceptación en bitácora
    await registrarBitacora(
      'ACEPTACION_CONTRATO_EXITOSA',
      obtenerUsuarioActual(req),
      {
        id_contrato,
        numero_contrato: contratoAceptado.numero_contrato,
        cedula_emprendedor: contratoAceptado.cedula_emprendedor,
        estatus_anterior: contratoActual.rows[0].estatus,
        estatus_nuevo: 'aceptado',
        fecha_aceptacion: new Date().toISOString()
      }
    );

    res.status(200).json({
      message: 'Contrato aceptado correctamente',
      contrato: contratoAceptado
    });
  } catch (error) {
    console.error('Error al aceptar el contrato:', error);
    
    await registrarBitacora(
      'ERROR_ACEPTACION_CONTRATO',
      obtenerUsuarioActual(req),
      {
        id_contrato,
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar un contrato (ACTUALIZADA CON monto_restado)
router.put('/:id_contrato', logOperacion('ACTUALIZAR_CONTRATO'), async (req, res) => {
  const { id_contrato } = req.params;
  
  try {
    let {
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
    } = req.body;

    // Obtener datos antiguos para la bitácora
    const contratoAnterior = await query(
      'SELECT * FROM contrato WHERE id_contrato = $1',
      [id_contrato]
    );

    if (contratoAnterior.rows.length === 0) {
      await registrarBitacora(
        'INTENTO_ACTUALIZAR_CONTRATO_NO_EXISTENTE',
        obtenerUsuarioActual(req),
        { id_contrato }
      );

      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

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
        monto_bs_neto = $3,
        monto_restado = $4,
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
        estatus,
        id_contrato
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const contratoActualizado = resultado.rows[0];

    // Registrar actualización en bitácora con cambios
    const cambios = {};
    const datosAnteriores = contratoAnterior.rows[0];
    
    // Comparar campos numéricos
    if (datosAnteriores.monto_aprob_euro !== monto_aprob_euro) 
      cambios.monto_aprob_euro = { anterior: datosAnteriores.monto_aprob_euro, nuevo: monto_aprob_euro };
    if (datosAnteriores.monto_bs !== monto_bs) 
      cambios.monto_bs = { anterior: datosAnteriores.monto_bs, nuevo: monto_bs };
    if (datosAnteriores.monto_bs_neto !== monto_bs_neto) 
      cambios.monto_bs_neto = { anterior: datosAnteriores.monto_bs_neto, nuevo: monto_bs_neto };
    if (datosAnteriores.monto_restado !== monto_restado) 
      cambios.monto_restado = { anterior: datosAnteriores.monto_restado, nuevo: monto_restado };
    if (datosAnteriores.estatus !== estatus) 
      cambios.estatus = { anterior: datosAnteriores.estatus, nuevo: estatus };

    await registrarBitacora(
      'ACTUALIZACION_CONTRATO_EXITOSA',
      obtenerUsuarioActual(req),
      {
        id_contrato,
        numero_contrato: contratoActualizado.numero_contrato,
        cedula_emprendedor: contratoActualizado.cedula_emprendedor,
        cambios,
        fecha_actualizacion: new Date().toISOString()
      }
    );

    res.status(200).json({
      message: 'Contrato actualizado correctamente',
      contrato: contratoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar el contrato:', error);
    
    await registrarBitacora(
      'ERROR_ACTUALIZACION_CONTRATO',
      obtenerUsuarioActual(req),
      {
        id_contrato: req.params.id_contrato,
        datos_intento: {
          monto_aprob_euro: req.body.monto_aprob_euro,
          monto_bs: req.body.monto_bs,
          estatus: req.body.estatus
        },
        error: error.message
      }
    );

    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener bitácora de un contrato específico
router.get('/:id_contrato/bitacora', async (req, res) => {
  try {
    const { id_contrato } = req.params;
    
    const resultado = await query(
      `SELECT * FROM bitacora 
       WHERE detalles->>'id_contrato' = $1 
       OR detalles->'cambios'->>'id_contrato' = $1
       OR detalles->>'numero_contrato' IN (
         SELECT numero_contrato FROM contrato WHERE id_contrato = $1
       )
       ORDER BY fecha DESC`,
      [id_contrato]
    );

    await registrarBitacora(
      'CONSULTA_BITACORA_CONTRATO',
      obtenerUsuarioActual(req),
      { id_contrato }
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener bitácora del contrato:', error);
    res.status(500).json({ error: 'Error al obtener bitácora' });
  }
});

module.exports = router;