const express = require("express");
const { query } = require("../config/conexion");
const multer = require('multer');
const path = require('path');
const { registrarBitacora } = require('../middlewares/bitacora');

const router = express.Router();

// 🔥 CONFIGURACIÓN MULTER PARA SUBIR ARCHIVOS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Carpeta específica para archivos de fiadores
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fiador-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Validar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  }
});

// 🔥 ENDPOINT PARA CREAR UN NUEVO FIADOR CON ARCHIVO
router.post("/", upload.single('foto_rif_fiscal'), async (req, res) => {
  try {
    const {
      id_req,
      cedula_emprendedor,
      cedula_fiador,
      nombre_completo_fiador,
      telefono_fiador,
      correo_fiador,
      verificacion_fiador
    } = req.body;

    console.log('📥 Datos recibidos para nuevo fiador:', {
      id_req,
      cedula_emprendedor,
      cedula_fiador,
      nombre_completo_fiador,
      telefono_fiador,
      correo_fiador,
      archivo_subido: req.file ? req.file.filename : 'Ninguno'
    });

    // Validar campos requeridos
    if (!id_req || !cedula_emprendedor || !cedula_fiador || !nombre_completo_fiador || !telefono_fiador) {
      await registrarBitacora('ERROR_VALIDACION_FIADOR', req.usuario?.cedula_usuario, {
        id_req,
        cedula_emprendedor,
        error: 'Campos requeridos faltantes'
      });
      
      return res.status(400).json({ 
        message: "Los campos id_req, cedula_emprendedor, cedula_fiador, nombre_completo_fiador y telefono_fiador son requeridos" 
      });
    }

    // Verificar que no exista ya un fiador para este id_req
    const fiadorExistente = await query(
      'SELECT * FROM fiador WHERE id_req = $1',
      [id_req]
    );

    if (fiadorExistente.rows.length > 0) {
      return res.status(409).json({ 
        message: "Ya existe un fiador registrado para este requerimiento" 
      });
    }

    // Obtener el nombre del archivo si se subió
    const nombreArchivo = req.file ? req.file.filename : null;

    // Insertar el nuevo fiador
    const resultado = await query(
      `INSERT INTO fiador (
        id_req,
        cedula_emprendedor,
        cedula_fiador,
        nombre_completo_fiador,
        telefono_fiador,
        correo_fiador,
        foto_rif_fiscal,
        verificacion_fiador
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id_req,
        cedula_emprendedor,
        cedula_fiador,
        nombre_completo_fiador,
        telefono_fiador,
        correo_fiador || null,
        nombreArchivo, // Guardar el nombre del archivo
        verificacion_fiador || "Pendiente"
      ]
    );

    console.log('✅ Fiador creado exitosamente:', resultado.rows[0]);

    await registrarBitacora('CREAR_FIADOR', req.usuario?.cedula_usuario, {
      id_req: id_req,
      cedula_emprendedor: cedula_emprendedor,
      cedula_fiador: cedula_fiador,
      nombre_fiador: nombre_completo_fiador,
      id_fiador: resultado.rows[0].id_fiador,
      archivo_subido: nombreArchivo ? 'Sí' : 'No'
    });

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("❌ Error al crear el fiador:", error);
    
    await registrarBitacora('ERROR_CREAR_FIADOR', req.usuario?.cedula_usuario, {
      id_req: req.body.id_req,
      cedula_emprendedor: req.body.cedula_emprendedor,
      error: error.message,
      detalles: error.detail || 'Sin detalles adicionales'
    });
    
    let mensajeError = "Error interno del servidor";
    if (error.code === '23503') {
      mensajeError = "El id_req proporcionado no existe";
    } else if (error.code === '23505') {
      mensajeError = "Ya existe un fiador para este requerimiento";
    }
    
    res.status(500).json({ 
      message: mensajeError,
      error: error.message,
      code: error.code
    });
  }
});

// 🔥 ENDPOINT PARA ACTUALIZAR FIADOR CON ARCHIVO
router.put("/:id_fiador", upload.single('foto_rif_fiscal'), async (req, res) => {
  try {
    const { id_fiador } = req.params;
    const {
      cedula_fiador,
      nombre_completo_fiador,
      telefono_fiador,
      correo_fiador,
      verificacion_fiador
    } = req.body;

    // Obtener el fiador actual
    const fiadorActual = await query(
      `SELECT * FROM fiador WHERE id_fiador = $1`,
      [id_fiador]
    );

    if (fiadorActual.rows.length === 0) {
      return res.status(404).json({ message: "Fiador no encontrado" });
    }

    // Construir consulta dinámica
    let queryParts = [];
    let queryParams = [];
    let paramCount = 1;

    if (cedula_fiador !== undefined) {
      queryParts.push(`cedula_fiador = $${paramCount}`);
      queryParams.push(cedula_fiador);
      paramCount++;
    }

    if (nombre_completo_fiador !== undefined) {
      queryParts.push(`nombre_completo_fiador = $${paramCount}`);
      queryParams.push(nombre_completo_fiador);
      paramCount++;
    }

    if (telefono_fiador !== undefined) {
      queryParts.push(`telefono_fiador = $${paramCount}`);
      queryParams.push(telefono_fiador);
      paramCount++;
    }

    if (correo_fiador !== undefined) {
      queryParts.push(`correo_fiador = $${paramCount}`);
      queryParams.push(correo_fiador);
      paramCount++;
    }

    // Manejar archivo subido
    if (req.file) {
      queryParts.push(`foto_rif_fiscal = $${paramCount}`);
      queryParams.push(req.file.filename);
      paramCount++;
    }

    if (verificacion_fiador !== undefined) {
      queryParts.push(`verificacion_fiador = $${paramCount}`);
      queryParams.push(verificacion_fiador);
      paramCount++;
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    queryParams.push(id_fiador);

    const queryString = `
      UPDATE fiador 
      SET ${queryParts.join(', ')} 
      WHERE id_fiador = $${paramCount} 
      RETURNING *
    `;

    const resultado = await query(queryString, queryParams);

    await registrarBitacora('ACTUALIZAR_FIADOR', req.usuario?.cedula_usuario, {
      id_fiador: id_fiador,
      cedula_fiador: resultado.rows[0].cedula_fiador,
      cambios: {
        ...req.body,
        archivo_actualizado: req.file ? 'Sí' : 'No'
      }
    });

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar fiador:", error);
    
    await registrarBitacora('ERROR_ACTUALIZAR_FIADOR', req.usuario?.cedula_usuario, {
      id_fiador: req.params.id_fiador,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// 🔥 ENDPOINT PARA OBTENER ARCHIVO DEL FIADOR
router.get("/archivo/:nombre_archivo", async (req, res) => {
  try {
    const { nombre_archivo } = req.params;
    const filePath = path.join(__dirname, '../uploads/fiadores', nombre_archivo);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        res.status(404).json({ message: 'Archivo no encontrado' });
      }
    });
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Los demás endpoints (GET, DELETE) permanecen igual...
// 🔥 ENDPOINT PARA OBTENER FIADOR POR ID_REQ
router.get("/requerimiento/:id_req", async (req, res) => {
  try {
    const { id_req } = req.params;

    const resultado = await query(
      `SELECT fs.*, re.opt_requerimiento, s.motivo, s.estatus
       FROM fiador fs
       LEFT JOIN requerimiento_emprendedor re ON fs.id_req = re.id_req
       LEFT JOIN solicitud s ON fs.id_req = s.id_req
       WHERE fs.id_req = $1`,
      [id_req]
    );

    if (resultado.rows.length > 0) {
      await registrarBitacora('CONSULTAR_FIADOR_POR_REQ', req.usuario?.cedula_usuario, {
        id_req: id_req,
        cedula_fiador: resultado.rows[0].cedula_fiador
      });
      
      res.json(resultado.rows[0]);
    } else {
      res.status(404).json({ message: "Fiador no encontrado para este requerimiento" });
    }
  } catch (error) {
    console.error("Error al obtener fiador por id_req:", error);
    
    await registrarBitacora('ERROR_CONSULTA_FIADOR_POR_REQ', req.usuario?.cedula_usuario, {
      id_req: req.params.id_req,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// 🔥 ENDPOINT PARA OBTENER FIADORES POR CÉDULA DEL EMPRENDEDOR
router.get("/emprendedor/:cedula_emprendedor", async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;

    const resultado = await query(
      `SELECT fs.*, re.opt_requerimiento, s.motivo, s.estatus, s.fecha_creacion
       FROM fiador fs
       LEFT JOIN requerimiento_emprendedor re ON fs.id_req = re.id_req
       LEFT JOIN solicitud s ON fs.id_req = s.id_req
       WHERE fs.cedula_emprendedor = $1
       ORDER BY fs.id_fiador DESC`,
      [cedula_emprendedor]
    );

    await registrarBitacora('CONSULTAR_FIADORES_POR_EMPRENDEDOR', req.usuario?.cedula_usuario, {
      cedula_emprendedor: cedula_emprendedor,
      cantidad_fiadores: resultado.rows.length
    });
    
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener fiadores por cédula:", error);
    
    await registrarBitacora('ERROR_CONSULTA_FIADORES_POR_EMPRENDEDOR', req.usuario?.cedula_usuario, {
      cedula_emprendedor: req.params.cedula_emprendedor,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

// 🔥 ENDPOINT PARA ELIMINAR FIADOR
router.delete("/:id_fiador", async (req, res) => {
  try {
    const { id_fiador } = req.params;

    // Verificar que existe
    const fiadorExistente = await query(
      `SELECT * FROM fiador WHERE id_fiador = $1`,
      [id_fiador]
    );

    if (fiadorExistente.rows.length === 0) {
      return res.status(404).json({ message: "Fiador no encontrado" });
    }

    const resultado = await query(
      `DELETE FROM fiador WHERE id_fiador = $1 RETURNING *`,
      [id_fiador]
    );

    await registrarBitacora('ELIMINAR_FIADOR', req.usuario?.cedula_usuario, {
      id_fiador: id_fiador,
      cedula_fiador: resultado.rows[0].cedula_fiador,
      cedula_emprendedor: resultado.rows[0].cedula_emprendedor
    });

    res.json({ 
      message: "Fiador eliminado correctamente", 
      fiador: resultado.rows[0] 
    });
  } catch (error) {
    console.error("Error al eliminar fiador:", error);
    
    await registrarBitacora('ERROR_ELIMINAR_FIADOR', req.usuario?.cedula_usuario, {
      id_fiador: req.params.id_fiador,
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;