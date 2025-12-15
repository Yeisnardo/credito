const express = require("express");
const { query } = require("../config/conexion");
const multer = require('multer');
const upload = multer();
const { registrarBitacora } = require('../middlewares/bitacora');

const router = express.Router();

// 🔥 NUEVO ENDPOINT: Actualizar solicitud SOLO por id_req
router.put("/requerimiento/:id_req", async (req, res) => {
  try {
    const { id_req } = req.params;
    const { estatus, motivo_rechazo } = req.body;

    console.log('🎯 Actualizando solicitud por id_req:', {
      id_req,
      estatus,
      motivo_rechazo
    });

    // Obtener la solicitud actual para registrar cambios
    const solicitudActual = await query(
      `SELECT * FROM solicitud WHERE id_req = $1`,
      [id_req]
    );

    if (solicitudActual.rows.length === 0) {
      await registrarBitacora('INTENTO_ACTUALIZAR_SOLICITUD_POR_REQ_INEXISTENTE', req.usuario?.cedula_usuario, {
        id_req: id_req
      });
      
      return res.status(404).json({ 
        message: "Solicitud no encontrada para ese requerimiento" 
      });
    }

    const solicitudPrevia = solicitudActual.rows[0];
    
    // Construir la consulta
    const resultado = await query(
      `UPDATE solicitud 
       SET estatus = $1, 
           motivo_rechazo = COALESCE($2, motivo_rechazo)
       WHERE id_req = $3 
       RETURNING *`,
      [estatus, motivo_rechazo, id_req]
    );

    console.log('✅ Solicitud actualizada exitosamente:', resultado.rows[0]);

    await registrarBitacora('ACTUALIZAR_SOLICITUD_POR_REQ', req.usuario?.cedula_usuario, {
      id_req: id_req,
      cedula_emprendedor: resultado.rows[0].cedula_emprendedor,
      cambios: {
        estatus_anterior: solicitudPrevia.estatus,
        estatus_nuevo: estatus,
        motivo_rechazo_anterior: solicitudPrevia.motivo_rechazo,
        motivo_rechazo_nuevo: motivo_rechazo
      },
      id_contrato: resultado.rows[0].id_contrato
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar la solicitud por id_req:", error);
    
    await registrarBitacora('ERROR_ACTUALIZAR_SOLICITUD_POR_REQ', req.usuario?.cedula_usuario, {
      id_req: req.params.id_req,
      error: error.message
    });
    
    res.status(500).json({ 
      message: "Error al actualizar la solicitud",
      error: error.message 
    });
  }
});

// 🔥 ENDPOINT PARA OBTENER SOLICITUD POR id_req
router.get("/requerimiento/:id_req", async (req, res) => {
  try {
    const { id_req } = req.params;

    const resultado = await query(
      `SELECT s.*, p.nombre_completo, p.nombre_emprendimiento
       FROM solicitud s
       LEFT JOIN persona p ON s.cedula_emprendedor = p.cedula
       WHERE s.id_req = $1`,
      [id_req]
    );

    if (resultado.rows.length > 0) {
      res.json(resultado.rows[0]);
    } else {
      res.status(404).json({ message: "Solicitud no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener solicitud por id_req:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener todas las solicitudes por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      `SELECT s.*, re.opt_requerimiento, re.verificacion 
       FROM solicitud s
       LEFT JOIN requerimiento_emprendedor re ON s.id_req = re.id_req
       WHERE s.cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (resultado.rows.length > 0) {
      await registrarBitacora('CONSULTAR_SOLICITUDES', req.usuario?.cedula_usuario, {
        cedula_consultada: cedula_emprendedor,
        cantidad_solicitudes: resultado.rows.length
      });
      
      res.json(resultado.rows);
    } else {
      await registrarBitacora('CONSULTAR_SOLICITUDES', req.usuario?.cedula_usuario, {
        cedula_consultada: cedula_emprendedor,
        resultado: 'No se encontraron solicitudes'
      });
      
      res.status(404).json({ message: "No se encontraron solicitudes para esa cédula" });
    }
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    
    await registrarBitacora('ERROR_CONSULTA_SOLICITUDES', req.usuario?.cedula_usuario, {
      cedula_consultada: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las solicitudes
router.get("/", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT s.*, p.nombre_completo, re.opt_requerimiento, re.verificacion 
       FROM solicitud s
       LEFT JOIN persona p ON s.cedula_emprendedor = p.cedula
       LEFT JOIN requerimiento_emprendedor re ON s.id_req = re.id_req
       ORDER BY s.id_contrato DESC`
    );
    
    await registrarBitacora('CONSULTAR_TODAS_SOLICITUDES', req.usuario?.cedula_usuario, {
      cantidad_registros: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener todas las solicitudes:", error);
    
    await registrarBitacora('ERROR_CONSULTA_TODAS_SOLICITUDES', req.usuario?.cedula_usuario, {
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Obtener solicitud por ID de contrato
router.get("/id/:id_contrato", async (req, res) => {
  try {
    const { id_contrato } = req.params;

    const resultado = await query(
      `SELECT s.*, p.nombre_completo, re.opt_requerimiento, re.verificacion 
       FROM solicitud s
       LEFT JOIN persona p ON s.cedula_emprendedor = p.cedula
       LEFT JOIN requerimiento_emprendedor re ON s.id_req = re.id_req
       WHERE s.id_contrato = $1`,
      [id_contrato]
    );

    if (resultado.rows.length > 0) {
      await registrarBitacora('CONSULTAR_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
        id_contrato: id_contrato,
        cedula_emprendedor: resultado.rows[0].cedula_emprendedor
      });
      
      res.json(resultado.rows[0]);
    } else {
      await registrarBitacora('CONSULTAR_SOLICITUD_POR_ID_NO_ENCONTRADA', req.usuario?.cedula_usuario, {
        id_contrato: id_contrato
      });
      
      res.status(404).json({ message: "Solicitud no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la solicitud:", error);
    
    await registrarBitacora('ERROR_CONSULTA_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
      id_contrato: req.params.id_contrato,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Obtener nombres de personas con solicitudes aprobadas
router.get("/estatus/aprobada", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT 
        p.nombre_completo, 
        p.cedula, 
        nc.numero_contrato,
        c.id_contrato,
        c.numero_contrato AS numero_contrato_tabla,
        c.monto_aprob_euro,
        c.monto_bs,
        c.monto_bs_neto,
        c.monto_restado,
        c.diezinteres,
        c.monto_devolver,
        c.monto_semanal,
        c.monto_cuota,
        c.frecuencia_pago_contrato,
        c.cuotas,
        c.gracia,
        c.interes,
        c.morosidad,
        c.dias_personalizados,
        c.fecha_desde,
        c.fecha_hasta,
        c.estatus,
        ct.banco,
        ct.cedula_titular,
        ct.nombre_completo AS nombre_completo_cuenta,
        ct.numero_cuenta,
        s.id_req,
        re.opt_requerimiento,
        re.verificacion
      FROM solicitud s
      JOIN persona p ON s.cedula_emprendedor = p.cedula
      LEFT JOIN requerimiento_emprendedor re ON s.id_req = re.id_req
      LEFT JOIN n_contrato nc ON p.cedula = nc.cedula_emprendedor
      LEFT JOIN contrato c ON nc.numero_contrato = c.numero_contrato
      LEFT JOIN cuenta ct ON p.cedula = ct.cedula_emprendedor
      WHERE s.estatus = 'Aprobada'`
    );
    
    await registrarBitacora('CONSULTAR_SOLICITUDES_APROBADAS', req.usuario?.cedula_usuario, {
      cantidad_registros: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener nombres de personas con solicitudes aprobadas:", error);
    
    await registrarBitacora('ERROR_CONSULTA_SOLICITUDES_APROBADAS', req.usuario?.cedula_usuario, {
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Obtener solicitudes por estatus
router.get("/estatus/:estatus", async (req, res) => {
  try {
    const { estatus } = req.params;

    const resultado = await query(
      `SELECT s.*, p.nombre_completo, re.opt_requerimiento, re.verificacion 
       FROM solicitud s
       LEFT JOIN persona p ON s.cedula_emprendedor = p.cedula
       LEFT JOIN requerimiento_emprendedor re ON s.id_req = re.id_req
       WHERE s.estatus = $1
       ORDER BY s.id_contrato DESC`,
      [estatus]
    );

    await registrarBitacora('CONSULTAR_SOLICITUDES_POR_ESTATUS', req.usuario?.cedula_usuario, {
      estatus: estatus,
      cantidad_registros: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener solicitudes por estatus:", error);
    
    await registrarBitacora('ERROR_CONSULTA_SOLICITUDES_POR_ESTATUS', req.usuario?.cedula_usuario, {
      estatus: req.params.estatus,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear una nueva solicitud
router.post("/", upload.none(), async (req, res) => {
  try {
    const { cedula_emprendedor, motivo, estatus, id_req } = req.body;

    console.log('📥 Datos recibidos para nueva solicitud:', {
      cedula_emprendedor,
      motivo,
      estatus,
      id_req
    });

    // Validar campos requeridos
    if (!cedula_emprendedor || !motivo || !estatus) {
      await registrarBitacora('ERROR_VALIDACION_SOLICITUD', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor,
        error: 'Campos requeridos faltantes'
      });
      
      return res.status(400).json({ 
        message: "Los campos cedula_emprendedor, motivo y estatus son requeridos" 
      });
    }

    // Validar que id_req sea proporcionado y exista
    if (!id_req) {
      return res.status(400).json({ 
        message: "El campo id_req es requerido" 
      });
    }

    // Validar que exista el requerimiento_emprendedor
    const requerimientoExists = await query(
      'SELECT id_req FROM requerimiento_emprendedor WHERE id_req = $1',
      [id_req]
    );
    
    if (requerimientoExists.rows.length === 0) {
      return res.status(404).json({ 
        message: 'El requerimiento especificado no existe' 
      });
    }

    // Insertar la nueva solicitud
    const resultado = await query(
      `INSERT INTO solicitud (
        cedula_emprendedor,
        motivo,
        estatus,
        id_req
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [cedula_emprendedor, motivo, estatus, id_req]
    );

    console.log('✅ Solicitud creada exitosamente:', resultado.rows[0]);

    await registrarBitacora('CREAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      motivo: motivo,
      estatus: estatus,
      id_req: id_req,
      id_solicitud: resultado.rows[0].id_contrato,
      id_contrato: resultado.rows[0].id_contrato
    });

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear la solicitud:", error);
    
    await registrarBitacora('ERROR_CREAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.body.cedula_emprendedor,
      id_req: req.body.id_req,
      error: error.message,
      detalles: error.detail || 'Sin detalles adicionales'
    });
    
    let mensajeError = "Error interno del servidor";
    if (error.code === '23503') {
      mensajeError = "El id_req proporcionado no existe en la tabla requerimiento_emprendedor";
    } else if (error.code === '23502') {
      mensajeError = "El campo id_req no puede ser nulo";
    }
    
    res.status(500).json({ 
      message: mensajeError,
      error: error.message,
      code: error.code
    });
  }
});

// Endpoint para actualizar una solicitud por cédula del emprendedor
router.put("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estatus, motivo, id_req, motivo_rechazo } = req.body;

    // Obtener la solicitud actual para registrar cambios
    const solicitudActual = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudActual.rows.length === 0) {
      await registrarBitacora('INTENTO_ACTUALIZAR_SOLICITUD_INEXISTENTE', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada para esa cédula" });
    }

    // Si se proporciona id_req, validar que exista
    if (id_req !== undefined && id_req !== null) {
      const requerimientoExists = await query(
        'SELECT id_req FROM requerimiento_emprendedor WHERE id_req = $1',
        [id_req]
      );
      
      if (requerimientoExists.rows.length === 0) {
        return res.status(404).json({ message: 'El requerimiento especificado no existe' });
      }
    }

    const solicitudPrevia = solicitudActual.rows[0];
    
    // Construir la consulta dinámicamente
    let queryParts = [];
    let queryParams = [];
    let paramCount = 1;

    if (estatus !== undefined) {
      queryParts.push(`estatus = $${paramCount}`);
      queryParams.push(estatus);
      paramCount++;
    }

    if (motivo !== undefined) {
      queryParts.push(`motivo = $${paramCount}`);
      queryParams.push(motivo);
      paramCount++;
    }

    if (id_req !== undefined) {
      queryParts.push(`id_req = $${paramCount}`);
      queryParams.push(id_req);
      paramCount++;
    }

    if (motivo_rechazo !== undefined) {
      queryParts.push(`motivo_rechazo = $${paramCount}`);
      queryParams.push(motivo_rechazo);
      paramCount++;
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    queryParams.push(cedula_emprendedor);

    const queryString = `
      UPDATE solicitud 
      SET ${queryParts.join(', ')} 
      WHERE cedula_emprendedor = $${paramCount} 
      RETURNING *
    `;

    const resultado = await query(queryString, queryParams);

    await registrarBitacora('ACTUALIZAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      cambios: {
        estatus_anterior: solicitudPrevia.estatus,
        estatus_nuevo: estatus,
        motivo_anterior: solicitudPrevia.motivo,
        motivo_nuevo: motivo,
        id_req_anterior: solicitudPrevia.id_req,
        id_req_nuevo: id_req,
        motivo_rechazo_anterior: solicitudPrevia.motivo_rechazo,
        motivo_rechazo_nuevo: motivo_rechazo
      },
      id_solicitud: resultado.rows[0].id_contrato
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar la solicitud:", error);
    
    await registrarBitacora('ERROR_ACTUALIZAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para actualizar una solicitud por ID de contrato
router.put("/id/:id_contrato", async (req, res) => {
  try {
    const { id_contrato } = req.params;
    const { estatus, motivo, id_req, motivo_rechazo } = req.body;

    // Obtener la solicitud actual para registrar cambios
    const solicitudActual = await query(
      `SELECT * FROM solicitud WHERE id_contrato = $1`,
      [id_contrato]
    );

    if (solicitudActual.rows.length === 0) {
      await registrarBitacora('INTENTO_ACTUALIZAR_SOLICITUD_POR_ID_INEXISTENTE', req.usuario?.cedula_usuario, {
        id_contrato: id_contrato
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Validar que exista el requerimiento_emprendedor si se proporciona id_req
    if (id_req) {
      const requerimientoExists = await query(
        'SELECT id_req FROM requerimiento_emprendedor WHERE id_req = $1',
        [id_req]
      );
      
      if (requerimientoExists.rows.length === 0) {
        return res.status(404).json({ message: 'El requerimiento especificado no existe' });
      }
    }

    const solicitudPrevia = solicitudActual.rows[0];
    
    // Construir la consulta dinámicamente
    let queryParts = [];
    let queryParams = [];
    let paramCount = 1;

    if (estatus !== undefined) {
      queryParts.push(`estatus = $${paramCount}`);
      queryParams.push(estatus);
      paramCount++;
    }

    if (motivo !== undefined) {
      queryParts.push(`motivo = $${paramCount}`);
      queryParams.push(motivo);
      paramCount++;
    }

    if (id_req !== undefined) {
      queryParts.push(`id_req = $${paramCount}`);
      queryParams.push(id_req || null);
      paramCount++;
    }

    if (motivo_rechazo !== undefined) {
      queryParts.push(`motivo_rechazo = $${paramCount}`);
      queryParams.push(motivo_rechazo);
      paramCount++;
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    queryParams.push(id_contrato);

    const queryString = `
      UPDATE solicitud 
      SET ${queryParts.join(', ')} 
      WHERE id_contrato = $${paramCount} 
      RETURNING *
    `;

    const resultado = await query(queryString, queryParams);

    await registrarBitacora('ACTUALIZAR_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
      id_contrato: id_contrato,
      cedula_emprendedor: resultado.rows[0].cedula_emprendedor,
      cambios: {
        estatus_anterior: solicitudPrevia.estatus,
        estatus_nuevo: estatus,
        motivo_anterior: solicitudPrevia.motivo,
        motivo_nuevo: motivo,
        id_req_anterior: solicitudPrevia.id_req,
        id_req_nuevo: id_req,
        motivo_rechazo_anterior: solicitudPrevia.motivo_rechazo,
        motivo_rechazo_nuevo: motivo_rechazo
      }
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar la solicitud por ID:", error);
    
    await registrarBitacora('ERROR_ACTUALIZAR_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
      id_contrato: req.params.id_contrato,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para cambiar estatus de solicitud
router.put("/:cedula_emprendedor/estatus", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estatus, motivo_rechazo } = req.body;

    if (!estatus) {
      return res.status(400).json({ message: "El estatus es requerido" });
    }

    // Obtener la solicitud actual
    const solicitudActual = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudActual.rows.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    const estatusAnterior = solicitudActual.rows[0].estatus;

    // Construir consulta dinámica para incluir motivo_rechazo si se proporciona
    let queryText = `UPDATE solicitud SET estatus = $1`;
    let queryParams = [estatus];
    let paramCount = 2;

    if (motivo_rechazo !== undefined) {
      queryText += `, motivo_rechazo = $${paramCount}`;
      queryParams.push(motivo_rechazo);
      paramCount++;
    }

    queryText += ` WHERE cedula_emprendedor = $${paramCount} RETURNING *`;
    queryParams.push(cedula_emprendedor);

    const resultado = await query(queryText, queryParams);

    await registrarBitacora('CAMBIAR_ESTATUS_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      estatus_anterior: estatusAnterior,
      estatus_nuevo: estatus,
      motivo_rechazo: motivo_rechazo,
      id_solicitud: resultado.rows[0].id_contrato
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al cambiar estatus de la solicitud:", error);
    
    await registrarBitacora('ERROR_CAMBIAR_ESTATUS_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para eliminar una solicitud por cédula
router.delete("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    // Obtener la solicitud antes de eliminar para registrar
    const solicitudAEliminar = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudAEliminar.rows.length === 0) {
      await registrarBitacora('INTENTO_ELIMINAR_SOLICITUD_INEXISTENTE', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    const resultado = await query(
      `DELETE FROM solicitud WHERE cedula_emprendedor = $1 RETURNING *`,
      [cedula_emprendedor]
    );

    await registrarBitacora('ELIMINAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      solicitud_eliminada: solicitudAEliminar.rows[0]
    });

    res.json({ 
      message: "Solicitud eliminada correctamente", 
      solicitud: resultado.rows[0] 
    });
  } catch (error) {
    console.error("Error al eliminar la solicitud:", error);
    
    await registrarBitacora('ERROR_ELIMINAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para eliminar una solicitud por ID de contrato
router.delete("/id/:id_contrato", async (req, res) => {
  try {
    const { id_contrato } = req.params;

    // Obtener la solicitud antes de eliminar para registrar
    const solicitudAEliminar = await query(
      `SELECT * FROM solicitud WHERE id_contrato = $1`,
      [id_contrato]
    );

    if (solicitudAEliminar.rows.length === 0) {
      await registrarBitacora('INTENTO_ELIMINAR_SOLICITUD_POR_ID_INEXISTENTE', req.usuario?.cedula_usuario, {
        id_contrato: id_contrato
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    const resultado = await query(
      `DELETE FROM solicitud WHERE id_contrato = $1 RETURNING *`,
      [id_contrato]
    );

    await registrarBitacora('ELIMINAR_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
      id_contrato: id_contrato,
      cedula_emprendedor: solicitudAEliminar.rows[0].cedula_emprendedor,
      solicitud_eliminada: solicitudAEliminar.rows[0]
    });

    res.json({ 
      message: "Solicitud eliminada correctamente", 
      solicitud: resultado.rows[0] 
    });
  } catch (error) {
    console.error("Error al eliminar la solicitud por ID:", error);
    
    await registrarBitacora('ERROR_ELIMINAR_SOLICITUD_POR_ID', req.usuario?.cedula_usuario, {
      id_contrato: req.params.id_contrato,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;