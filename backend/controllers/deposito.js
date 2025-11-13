const express = require('express');
const path = require('path');
const multer = require('multer');
const { query } = require('../config/conexion');

const router = express.Router();

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

// Configuración multer para subir comprobantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo JPG, PNG, GIF o PDF.'));
    }
  },
});

// Ruta para crear depósito con comprobante
router.post('/', upload.single('comprobante'), logOperacion('CREAR_DEPOSITO'), async (req, res) => {
  try {
    const { cedula_emprendedor, estado, monto, fecha_deposito, numero_referencia } = req.body;
    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Validar campos requeridos
    if (!cedula_emprendedor || !estado) {
      await registrarBitacora('ERROR_VALIDACION_DEPOSITO', obtenerUsuarioActual(req), {
        cedula_emprendedor: cedula_emprendedor,
        estado: estado,
        error: 'Campos requeridos faltantes'
      });
      
      return res.status(400).json({ 
        error: 'Los campos cedula_emprendedor y estado son obligatorios' 
      });
    }

    // Verificar si el emprendedor existe
    const emprendedorExists = await query(
      'SELECT cedula FROM persona WHERE cedula = $1',
      [cedula_emprendedor]
    );

    if (emprendedorExists.rows.length === 0) {
      await registrarBitacora('ERROR_CREACION_DEPOSITO_EMPREMDEDOR_INEXISTENTE', obtenerUsuarioActual(req), {
        cedula_emprendedor: cedula_emprendedor,
        error: 'Emprendedor no existe'
      });
      
      return res.status(404).json({ 
        error: 'El emprendedor especificado no existe' 
      });
    }

    const resultado = await query(
      `INSERT INTO deposito (cedula_emprendedor, comprobante, estado, monto, fecha_deposito, numero_referencia)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cedula_emprendedor, comprobantePath, estado, monto, fecha_deposito, numero_referencia]
    );

    const nuevoDeposito = resultado.rows[0];

    // Registrar en bitácora
    await registrarBitacora('CREACION_DEPOSITO_EXITOSA', obtenerUsuarioActual(req), {
      id_deposito: nuevoDeposito.id_deposito,
      cedula_emprendedor: cedula_emprendedor,
      estado: estado,
      monto: monto,
      fecha_deposito: fecha_deposito,
      numero_referencia: numero_referencia,
      comprobante_subido: !!comprobantePath,
      nombre_comprobante: req.file ? req.file.filename : null,
      fecha_creacion: new Date().toISOString()
    });

    res.status(201).json({
      ...nuevoDeposito,
      comprobante: comprobantePath,
    });
  } catch (error) {
    console.error('Error en createDeposito:', error);
    
    await registrarBitacora('ERROR_CREACION_DEPOSITO', obtenerUsuarioActual(req), {
      cedula_emprendedor: req.body.cedula_emprendedor,
      datos_recibidos: {
        estado: req.body.estatus,
        monto: req.body.monto,
        fecha_deposito: req.body.fecha_deposito
      },
      error: error.message,
      tipo_error: error.code
    });
    
    res.status(500).json({ 
      error: error.message,
      detalles: 'Error al crear el depósito'
    });
  }
});

// Ruta para obtener depósitos por cédula
router.get('/cedula/:cedula_emprendedor', logOperacion('CONSULTAR_DEPOSITOS_CEDULA'), async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    // Verificar si el emprendedor existe
    const emprendedorExists = await query(
      'SELECT cedula, nombre_completo FROM persona WHERE cedula = $1',
      [cedula_emprendedor]
    );

    if (emprendedorExists.rows.length === 0) {
      await registrarBitacora('CONSULTA_DEPOSITOS_EMPREMDEDOR_INEXISTENTE', obtenerUsuarioActual(req), {
        cedula_emprendedor: cedula_emprendedor,
        resultado: 'Emprendedor no existe'
      });
      
      return res.status(404).json({ 
        error: 'El emprendedor especificado no existe' 
      });
    }

    const resultado = await query(
      `SELECT d.*, p.nombre_completo 
       FROM deposito d 
       LEFT JOIN persona p ON d.cedula_emprendedor = p.cedula 
       WHERE d.cedula_emprendedor = $1
       ORDER BY d.fecha_creacion DESC`,
      [cedula_emprendedor]
    );

    await registrarBitacora('CONSULTA_DEPOSITOS_POR_CEDULA_EXITOSA', obtenerUsuarioActual(req), {
      cedula_emprendedor: cedula_emprendedor,
      nombre_emprendedor: emprendedorExists.rows[0].nombre_completo,
      cantidad_depositos: resultado.rows.length,
      depositos_encontrados: resultado.rows.length > 0
    });

    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener depósitos:', error);
    
    await registrarBitacora('ERROR_CONSULTA_DEPOSITOS_CEDULA', obtenerUsuarioActual(req), {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error al obtener depósitos',
      detalles: error.message
    });
  }
});

// Ruta para obtener todos los depósitos
router.get('/', logOperacion('CONSULTAR_TODOS_DEPOSITOS'), async (req, res) => {
  try {
    const { estado, fecha_inicio, fecha_fin, page = 1, limit = 10 } = req.query;
    
    let queryText = `
      SELECT d.*, p.nombre_completo
      FROM deposito d
      LEFT JOIN persona p ON d.cedula_emprendedor = p.cedula
    `;
    
    let queryParams = [];
    let whereConditions = [];
    let paramCount = 1;

    // Aplicar filtros si existen
    if (estado) {
      whereConditions.push(`d.estado = $${paramCount}`);
      queryParams.push(estado);
      paramCount++;
    }

    if (fecha_inicio) {
      whereConditions.push(`d.fecha_creacion >= $${paramCount}`);
      queryParams.push(fecha_inicio);
      paramCount++;
    }

    if (fecha_fin) {
      whereConditions.push(`d.fecha_creacion <= $${paramCount}`);
      queryParams.push(fecha_fin);
      paramCount++;
    }

    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Ordenar y paginar
    queryText += ` ORDER BY d.fecha_creacion DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    const offset = (page - 1) * limit;
    queryParams.push(parseInt(limit), offset);

    const resultado = await query(queryText, queryParams);

    // Obtener total para paginación
    let countQuery = `SELECT COUNT(*) FROM deposito d`;
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    const countResult = await query(countQuery, queryParams.slice(0, -2)); // Excluir limit y offset
    const totalDepositos = parseInt(countResult.rows[0].count);

    await registrarBitacora('CONSULTA_TODOS_DEPOSITOS_EXITOSA', obtenerUsuarioActual(req), {
      cantidad_registros: resultado.rows.length,
      total_depositos: totalDepositos,
      filtros_aplicados: {
        estado: estado,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        pagina: page,
        limite: limit
      }
    });

    res.json({
      depositos: resultado.rows,
      paginacion: {
        pagina_actual: parseInt(page),
        total_paginas: Math.ceil(totalDepositos / limit),
        total_depositos: totalDepositos,
        hasNext: page * limit < totalDepositos,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener depósitos:', error);
    
    await registrarBitacora('ERROR_CONSULTA_TODOS_DEPOSITOS', obtenerUsuarioActual(req), {
      filtros_intentados: req.query,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error al obtener depósitos',
      detalles: error.message
    });
  }
});

// Ruta para obtener un depósito específico por ID
router.get('/:id_deposito', logOperacion('CONSULTAR_DEPOSITO_ID'), async (req, res) => {
  try {
    const { id_deposito } = req.params;

    const resultado = await query(
      `SELECT d.*, p.nombre_completo, p.cedula
       FROM deposito d
       LEFT JOIN persona p ON d.cedula_emprendedor = p.cedula
       WHERE d.id_deposito = $1`,
      [id_deposito]
    );

    if (resultado.rows.length === 0) {
      await registrarBitacora('CONSULTA_DEPOSITO_ID_NO_ENCONTRADO', obtenerUsuarioActual(req), {
        id_deposito: id_deposito,
        deposito_encontrado: false
      });
      
      return res.status(404).json({ 
        error: 'Depósito no encontrado' 
      });
    }

    await registrarBitacora('CONSULTA_DEPOSITO_ID_EXITOSA', obtenerUsuarioActual(req), {
      id_deposito: id_deposito,
      cedula_emprendedor: resultado.rows[0].cedula_emprendedor,
      estado: resultado.rows[0].estado,
      deposito_encontrado: true
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener depósito por ID:', error);
    
    await registrarBitacora('ERROR_CONSULTA_DEPOSITO_ID', obtenerUsuarioActual(req), {
      id_deposito: req.params.id_deposito,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error al obtener depósito',
      detalles: error.message
    });
  }
});

// Ruta para actualizar estado de depósito por id_deposito
router.put('/:id_deposito', logOperacion('ACTUALIZAR_DEPOSITO'), async (req, res) => {
  try {
    const { id_deposito } = req.params;
    const { estado, observaciones } = req.body;

    if (!estado) {
      await registrarBitacora('ERROR_ACTUALIZACION_DEPOSITO_SIN_ESTADO', obtenerUsuarioActual(req), {
        id_deposito: id_deposito,
        error: 'Estado no proporcionado'
      });
      
      return res.status(400).json({ 
        error: 'El campo estado es obligatorio' 
      });
    }

    // Obtener depósito actual para registrar cambios
    const depositoActual = await query(
      `SELECT * FROM deposito WHERE id_deposito = $1`,
      [id_deposito]
    );

    if (depositoActual.rows.length === 0) {
      await registrarBitacora('INTENTO_ACTUALIZAR_DEPOSITO_INEXISTENTE', obtenerUsuarioActual(req), {
        id_deposito: id_deposito,
        error: 'Depósito no encontrado'
      });
      
      return res.status(404).json({ 
        error: 'Depósito no encontrado' 
      });
    }

    const depositoPrevio = depositoActual.rows[0];

    const resultado = await query(
      `UPDATE deposito
       SET estado = $1, observaciones = COALESCE($2, observaciones)
       WHERE id_deposito = $3
       RETURNING *`,
      [estado, observaciones, id_deposito]
    );

    const depositoActualizado = resultado.rows[0];

    // Registrar cambios en bitácora
    await registrarBitacora('ACTUALIZACION_DEPOSITO_EXITOSA', obtenerUsuarioActual(req), {
      id_deposito: id_deposito,
      cedula_emprendedor: depositoActualizado.cedula_emprendedor,
      cambios: {
        estado_anterior: depositoPrevio.estado,
        estado_nuevo: estado,
        observaciones_anterior: depositoPrevio.observaciones,
        observaciones_nuevo: observaciones
      },
      fecha_actualizacion: new Date().toISOString()
    });

    res.json({ 
      message: 'Depósito actualizado exitosamente', 
      deposito: depositoActualizado 
    });
  } catch (error) {
    console.error('Error al actualizar depósito por id:', error);
    
    await registrarBitacora('ERROR_ACTUALIZACION_DEPOSITO', obtenerUsuarioActual(req), {
      id_deposito: req.params.id_deposito,
      datos_intento: {
        estado: req.body.estado,
        observaciones: req.body.observaciones
      },
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error en el servidor',
      detalles: error.message
    });
  }
});

// Ruta para eliminar un depósito
router.delete('/:id_deposito', logOperacion('ELIMINAR_DEPOSITO'), async (req, res) => {
  try {
    const { id_deposito } = req.params;

    // Obtener depósito antes de eliminar para registrar
    const depositoAEliminar = await query(
      `SELECT * FROM deposito WHERE id_deposito = $1`,
      [id_deposito]
    );

    if (depositoAEliminar.rows.length === 0) {
      await registrarBitacora('INTENTO_ELIMINAR_DEPOSITO_INEXISTENTE', obtenerUsuarioActual(req), {
        id_deposito: id_deposito,
        error: 'Depósito no encontrado'
      });
      
      return res.status(404).json({ 
        error: 'Depósito no encontrado' 
      });
    }

    const resultado = await query(
      `DELETE FROM deposito WHERE id_deposito = $1 RETURNING *`,
      [id_deposito]
    );

    const depositoEliminado = resultado.rows[0];

    await registrarBitacora('ELIMINACION_DEPOSITO_EXITOSA', obtenerUsuarioActual(req), {
      id_deposito: id_deposito,
      cedula_emprendedor: depositoEliminado.cedula_emprendedor,
      estado_eliminado: depositoEliminado.estado,
      comprobante_eliminado: depositoEliminado.comprobante,
      fecha_eliminacion: new Date().toISOString()
    });

    res.json({ 
      message: 'Depósito eliminado correctamente', 
      deposito: depositoEliminado 
    });
  } catch (error) {
    console.error('Error al eliminar depósito:', error);
    
    await registrarBitacora('ERROR_ELIMINACION_DEPOSITO', obtenerUsuarioActual(req), {
      id_deposito: req.params.id_deposito,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error al eliminar depósito',
      detalles: error.message
    });
  }
});

// Ruta para obtener bitácora de un depósito específico
router.get('/:id_deposito/bitacora', async (req, res) => {
  try {
    const { id_deposito } = req.params;
    
    const resultado = await query(
      `SELECT * FROM bitacora 
       WHERE detalles->>'id_deposito' = $1 
       OR detalles->>'cedula_emprendedor' IN (
         SELECT cedula_emprendedor FROM deposito WHERE id_deposito = $1
       )
       ORDER BY fecha DESC`,
      [id_deposito]
    );

    await registrarBitacora('CONSULTA_BITACORA_DEPOSITO', obtenerUsuarioActual(req), { 
      id_deposito: id_deposito,
      registros_encontrados: resultado.rows.length 
    });

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener bitácora del depósito:', error);
    res.status(500).json({ 
      error: 'Error al obtener bitácora',
      detalles: error.message
    });
  }
});

// Ruta para descargar comprobante
router.get('/comprobante/:id_deposito', async (req, res) => {
  try {
    const { id_deposito } = req.params;

    const resultado = await query(
      'SELECT comprobante FROM deposito WHERE id_deposito = $1',
      [id_deposito]
    );

    if (resultado.rows.length === 0 || !resultado.rows[0].comprobante) {
      return res.status(404).json({ 
        error: 'Comprobante no encontrado' 
      });
    }

    const comprobantePath = path.join(__dirname, '..', resultado.rows[0].comprobante);
    
    await registrarBitacora('DESCARGA_COMPROBANTE_DEPOSITO', obtenerUsuarioActual(req), {
      id_deposito: id_deposito,
      comprobante_path: resultado.rows[0].comprobante
    });

    res.download(comprobantePath);
  } catch (error) {
    console.error('Error al descargar comprobante:', error);
    
    await registrarBitacora('ERROR_DESCARGA_COMPROBANTE', obtenerUsuarioActual(req), {
      id_deposito: req.params.id_deposito,
      error: error.message
    });
    
    res.status(500).json({ 
      error: 'Error al descargar comprobante',
      detalles: error.message
    });
  }
});

module.exports = router;