const express = require("express");
const { query } = require("../config/conexion"); // Conexión a la base de datos
const multer = require('multer');
const upload = multer(); // para datos sin archivos
const { registrarBitacora } = require('../middlewares/bitacora'); // Importar el middleware de bitácora

const router = express.Router();

// Endpoint para obtener todas las solicitudes por cédula del emprendedor
router.get("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (resultado.rows.length > 0) {
      // Registrar en bitácora la consulta de solicitudes
      await registrarBitacora('CONSULTAR_SOLICITUDES', req.usuario?.cedula_usuario, {
        cedula_consultada: cedula_emprendedor,
        cantidad_solicitudes: resultado.rows.length
      });
      
      res.json(resultado.rows);
    } else {
      // Registrar en bitácora incluso cuando no hay resultados
      await registrarBitacora('CONSULTAR_SOLICITUDES', req.usuario?.cedula_usuario, {
        cedula_consultada: cedula_emprendedor,
        resultado: 'No se encontraron solicitudes'
      });
      
      res
        .status(404)
        .json({ message: "No se encontraron solicitudes para esa cédula" });
    }
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_CONSULTA_SOLICITUDES', req.usuario?.cedula_usuario, {
      cedula_consultada: req.params.cedula_emprendedor,
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
        ct.numero_cuenta
      FROM solicitud s
      JOIN persona p ON s.cedula_emprendedor = p.cedula
      LEFT JOIN n_contrato nc ON p.cedula = nc.cedula_emprendedor
      LEFT JOIN contrato c ON nc.numero_contrato = c.numero_contrato
      LEFT JOIN cuenta ct ON p.cedula = ct.cedula_emprendedor
      WHERE s.estatus = 'Aprobada';`
    );
    
    // Registrar consulta de solicitudes aprobadas
    await registrarBitacora('CONSULTAR_SOLICITUDES_APROBADAS', req.usuario?.cedula_usuario, {
      cantidad_registros: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener nombres de personas con solicitudes aprobadas:", error);
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_CONSULTA_SOLICITUDES_APROBADAS', req.usuario?.cedula_usuario, {
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear una nueva solicitud
router.post("/", upload.none(), async (req, res) => {
  try {
    const { cedula_emprendedor, motivo, estatus } = req.body;

    // Verificar si ya existe una solicitud para este emprendedor
    const solicitudExistente = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudExistente.rows.length > 0) {
      // Registrar intento de crear solicitud duplicada
      await registrarBitacora('INTENTO_SOLICITUD_DUPLICADA', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor,
        motivo: motivo,
        estatus_solicitud_existente: solicitudExistente.rows[0].estatus
      });
      
      return res.status(400).json({ 
        message: "Ya existe una solicitud para este emprendedor" 
      });
    }

    const resultado = await query(
      `INSERT INTO solicitud (
        cedula_emprendedor,
        motivo,
        estatus
      ) VALUES ($1, $2, $3) RETURNING *`,
      [cedula_emprendedor, motivo, estatus]
    );

    // Registrar creación exitosa de solicitud
    await registrarBitacora('CREAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      motivo: motivo,
      estatus: estatus,
      id_solicitud: resultado.rows[0].id_solicitud
    });

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_CREAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.body.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para actualizar una solicitud por cédula del emprendedor
router.put("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estatus, motivo } = req.body;

    // Obtener la solicitud actual para registrar cambios
    const solicitudActual = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudActual.rows.length === 0) {
      // Registrar intento de actualizar solicitud inexistente
      await registrarBitacora('INTENTO_ACTUALIZAR_SOLICITUD_INEXISTENTE', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada para esa cédula" });
    }

    const solicitudPrevia = solicitudActual.rows[0];
    
    // Construir la consulta dinámicamente para permitir actualizaciones parciales
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

    // Registrar actualización exitosa de solicitud
    await registrarBitacora('ACTUALIZAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      cambios: {
        estatus_anterior: solicitudPrevia.estatus,
        estatus_nuevo: estatus,
        motivo_anterior: solicitudPrevia.motivo,
        motivo_nuevo: motivo
      },
      id_solicitud: resultado.rows[0].id_solicitud
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar la solicitud:", error);
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_ACTUALIZAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para eliminar una solicitud
router.delete("/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    // Obtener la solicitud antes de eliminar para registrar
    const solicitudAEliminar = await query(
      `SELECT * FROM solicitud WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );

    if (solicitudAEliminar.rows.length === 0) {
      // Registrar intento de eliminar solicitud inexistente
      await registrarBitacora('INTENTO_ELIMINAR_SOLICITUD_INEXISTENTE', req.usuario?.cedula_usuario, {
        cedula_emprendedor: cedula_emprendedor
      });
      
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    const resultado = await query(
      `DELETE FROM solicitud WHERE cedula_emprendedor = $1 RETURNING *`,
      [cedula_emprendedor]
    );

    // Registrar eliminación de solicitud
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
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_ELIMINAR_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para cambiar estatus de solicitud (endpoint específico)
router.put("/:cedula_emprendedor/estatus", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estatus } = req.body;

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

    const resultado = await query(
      `UPDATE solicitud SET estatus = $1 WHERE cedula_emprendedor = $2 RETURNING *`,
      [estatus, cedula_emprendedor]
    );

    // Registrar cambio de estatus específico
    await registrarBitacora('CAMBIAR_ESTATUS_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      estatus_anterior: estatusAnterior,
      estatus_nuevo: estatus,
      id_solicitud: resultado.rows[0].id_solicitud
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al cambiar estatus de la solicitud:", error);
    
    // Registrar error en bitácora
    await registrarBitacora('ERROR_CAMBIAR_ESTATUS_SOLICITUD', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;