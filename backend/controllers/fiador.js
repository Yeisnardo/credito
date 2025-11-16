const express = require("express");
const { query } = require("../config/conexion");
const multer = require('multer');
const upload = multer();
const { registrarBitacora } = require('../middlewares/bitacora');

const router = express.Router();

// 🔥 ENDPOINT: Obtener todos los requerimientos del fiador
router.get("/", async (req, res) => {
  try {
    const resultado = await query(
      "SELECT * FROM requerimiento_fiador ORDER BY idR_fiador DESC"
    );
    
    await registrarBitacora('CONSULTAR_REQUERIMIENTOS_FIADOR', req.usuario?.cedula_usuario, {
      cantidad_registros: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("❌ Error al obtener requerimientos del fiador:", error);
    
    await registrarBitacora('ERROR_CONSULTA_REQUERIMIENTOS_FIADOR', req.usuario?.cedula_usuario, {
      error: error.message
    });
    
    res.status(500).json({ 
      message: "Error al obtener los requerimientos del fiador",
      error: error.message 
    });
  }
});

// 🔥 ENDPOINT: Crear un nuevo requerimiento del fiador
router.post("/", upload.none(), async (req, res) => {
  try {
    const { nombre_reqf } = req.body;

    console.log('📥 Datos recibidos para nuevo requerimiento fiador:', {
      nombre_reqf
    });

    // Validar campos requeridos
    if (!nombre_reqf || !nombre_reqf.trim()) {
      await registrarBitacora('ERROR_VALIDACION_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
        nombre_reqf: nombre_reqf,
        error: 'Campo nombre_reqf faltante'
      });
      
      return res.status(400).json({ 
        message: "El campo nombre_reqf es requerido" 
      });
    }

    // Insertar el nuevo requerimiento
    const resultado = await query(
      `INSERT INTO requerimiento_fiador (nombre_reqf) VALUES ($1) RETURNING *`,
      [nombre_reqf.trim()]
    );

    console.log('✅ Requerimiento fiador creado exitosamente:', resultado.rows[0]);

    await registrarBitacora('CREAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      idR_fiador: resultado.rows[0].idr_fiador,
      nombre_reqf: nombre_reqf.trim()
    });

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear requerimiento del fiador:", error);
    
    await registrarBitacora('ERROR_CREAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      nombre_reqf: req.body.nombre_reqf,
      error: error.message,
      detalles: error.detail || 'Sin detalles adicionales'
    });
    
    let mensajeError = "Error interno del servidor";
    if (error.code === '23505') {
      mensajeError = "Ya existe un requerimiento con ese nombre";
    }
    
    res.status(500).json({ 
      message: mensajeError,
      error: error.message,
      code: error.code
    });
  }
});

// 🔥 ENDPOINT: Actualizar un requerimiento del fiador
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_reqf } = req.body;

    console.log('🎯 Actualizando requerimiento fiador:', {
      id,
      nombre_reqf
    });

    // Obtener el requerimiento actual para registrar cambios
    const requerimientoActual = await query(
      `SELECT * FROM requerimiento_fiador WHERE idR_fiador = $1`,
      [id]
    );

    if (requerimientoActual.rows.length === 0) {
      await registrarBitacora('INTENTO_ACTUALIZAR_REQUERIMIENTO_FIADOR_INEXISTENTE', req.usuario?.cedula_usuario, {
        idR_fiador: id
      });
      
      return res.status(404).json({ 
        message: "Requerimiento no encontrado" 
      });
    }

    const requerimientoPrevio = requerimientoActual.rows[0];
    
    // Construir la consulta
    const resultado = await query(
      `UPDATE requerimiento_fiador 
       SET nombre_reqf = $1
       WHERE idR_fiador = $2 
       RETURNING *`,
      [nombre_reqf.trim(), id]
    );

    console.log('✅ Requerimiento fiador actualizado exitosamente:', resultado.rows[0]);

    await registrarBitacora('ACTUALIZAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      idR_fiador: id,
      cambios: {
        nombre_anterior: requerimientoPrevio.nombre_reqf,
        nombre_nuevo: nombre_reqf.trim()
      }
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar requerimiento del fiador:", error);
    
    await registrarBitacora('ERROR_ACTUALIZAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      idR_fiador: req.params.id,
      error: error.message
    });
    
    res.status(500).json({ 
      message: "Error al actualizar el requerimiento del fiador",
      error: error.message 
    });
  }
});

// 🔥 ENDPOINT: Eliminar un requerimiento del fiador
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Eliminando requerimiento fiador:', id);

    // Obtener el requerimiento antes de eliminar para registrar
    const requerimientoAEliminar = await query(
      `SELECT * FROM requerimiento_fiador WHERE idR_fiador = $1`,
      [id]
    );

    if (requerimientoAEliminar.rows.length === 0) {
      await registrarBitacora('INTENTO_ELIMINAR_REQUERIMIENTO_FIADOR_INEXISTENTE', req.usuario?.cedula_usuario, {
        idR_fiador: id
      });
      
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    const resultado = await query(
      `DELETE FROM requerimiento_fiador WHERE idR_fiador = $1 RETURNING *`,
      [id]
    );

    console.log('✅ Requerimiento fiador eliminado exitosamente:', resultado.rows[0]);

    await registrarBitacora('ELIMINAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      idR_fiador: id,
      nombre_reqf: resultado.rows[0].nombre_reqf
    });

    res.json({ 
      message: "Requerimiento eliminado correctamente", 
      requerimiento: resultado.rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al eliminar requerimiento del fiador:", error);
    
    await registrarBitacora('ERROR_ELIMINAR_REQUERIMIENTO_FIADOR', req.usuario?.cedula_usuario, {
      idR_fiador: req.params.id,
      error: error.message
    });
    
    res.status(500).json({ 
      message: "Error al eliminar el requerimiento del fiador",
      error: error.message 
    });
  }
});

module.exports = router;