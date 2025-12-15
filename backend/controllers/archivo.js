const express = require('express');
const { query } = require('../config/conexion');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Asegurar que la carpeta uploads exista
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
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
    fileSize: 10 * 1024 * 1024
  }
});

// Obtener todos los archivos
router.get('/', async (req, res) => {
  try {
    const resultado = await query(`
      SELECT ra.*, re.opt_requerimiento, re.verificacion 
      FROM requerimiento_archivo ra
      LEFT JOIN requerimiento_emprendedor re ON ra.id_req = re.id_req
    `);
    
    const archivosConUrl = resultado.rows.map(archivo => ({
      ...archivo,
      url: `http://localhost:5000/uploads/${path.basename(archivo.archivo)}`
    }));
    
    res.json(archivosConUrl);
  } catch (err) {
    console.error('Error en getRequerimientoArchivos:', err);
    res.status(500).json({ message: 'Error al obtener requerimientos de archivos' });
  }
});

// Obtener archivos por id_req
router.get('/byReq/:id_req', async (req, res) => {
  try {
    const { id_req } = req.params;
    console.log('🔍 Buscando archivos para id_req:', id_req);
    
    const resultado = await query(
      `SELECT ra.*, re.opt_requerimiento, re.verificacion 
       FROM requerimiento_archivo ra
       LEFT JOIN requerimiento_emprendedor re ON ra.id_req = re.id_req
       WHERE ra.id_req = $1 ORDER BY ra.id_archivo DESC`,
      [id_req]
    );
    
    console.log('📁 Archivos encontrados:', resultado.rows.length);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron archivos para ese requerimiento' });
    }

    const archivosConUrl = resultado.rows.map(archivo => ({
      ...archivo,
      url: `http://localhost:5000/uploads/${path.basename(archivo.archivo)}`
    }));

    res.json(archivosConUrl);
  } catch (err) {
    console.error('Error en getArchivosPorIdReq:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Obtener archivos por cédula del emprendedor
router.get('/emprendedor/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    console.log('🔍 Buscando archivos para cédula:', cedula_emprendedor);
    
    const resultado = await query(
      `SELECT ra.*, re.opt_requerimiento, re.verificacion 
       FROM requerimiento_archivo ra
       LEFT JOIN requerimiento_emprendedor re ON ra.id_req = re.id_req
       WHERE ra.cedula_emprendedor = $1 ORDER BY ra.id_archivo DESC`,
      [cedula_emprendedor]
    );
    
    console.log('📁 Archivos encontrados:', resultado.rows.length);
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron archivos para este emprendedor' });
    }

    const archivosConUrl = resultado.rows.map(archivo => ({
      ...archivo,
      url: `http://localhost:5000/uploads/${path.basename(archivo.archivo)}`
    }));

    res.json(archivosConUrl);
  } catch (err) {
    console.error('Error en getArchivoPorCedulaEmprendedor:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Obtener archivo por ID de archivo
router.get('/:id_archivo', async (req, res) => {
  try {
    const { id_archivo } = req.params;
    const resultado = await query(
      `SELECT ra.*, re.opt_requerimiento, re.verificacion 
       FROM requerimiento_archivo ra
       LEFT JOIN requerimiento_emprendedor re ON ra.id_req = re.id_req
       WHERE ra.id_archivo = $1`,
      [id_archivo]
    );
    
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const archivo = resultado.rows[0];
    archivo.url = `http://localhost:5000/uploads/${path.basename(archivo.archivo)}`;

    res.json(archivo);
  } catch (err) {
    console.error('Error en getArchivoPorId:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Crear un nuevo archivo
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    const { cedula_emprendedor, fecha_llevar, id_req } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Archivo es requerido' });
    }

    const nombreArchivo = req.file.filename;

    // Validar que exista el requerimiento_emprendedor
    if (id_req) {
      const requerimientoExists = await query(
        'SELECT id_req FROM requerimiento_emprendedor WHERE id_req = $1',
        [id_req]
      );
      
      if (requerimientoExists.rows.length === 0) {
        return res.status(404).json({ message: 'El requerimiento especificado no existe' });
      }
    }

    if (!cedula_emprendedor || !fecha_llevar) {
      return res.status(400).json({ 
        message: 'Campos obligatorios incompletos: cedula_emprendedor, fecha_llevar son requeridos' 
      });
    }

    console.log('📤 Subiendo archivo:', {
      cedula_emprendedor,
      fecha_llevar,
      id_req,
      archivo: nombreArchivo
    });

    const resultado = await query(
      `INSERT INTO requerimiento_archivo (cedula_emprendedor, archivo, fecha_llevar, id_req)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [cedula_emprendedor, nombreArchivo, fecha_llevar, id_req || null]
    );

    const archivoCreado = resultado.rows[0];
    archivoCreado.url = `http://localhost:5000/uploads/${nombreArchivo}`;

    console.log('✅ Archivo creado exitosamente:', archivoCreado);

    res.status(201).json(archivoCreado);
  } catch (err) {
    console.error('❌ Error en crearArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

// Middleware para manejar errores de Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande' });
    }
  } else if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

// Actualizar un archivo existente
router.put('/:id_archivo', upload.single('archivo'), async (req, res) => {
  try {
    const { id_archivo } = req.params;
    const { cedula_emprendedor, fecha_llevar, id_req } = req.body;

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

    let nombreArchivo;
    if (req.file) {
      nombreArchivo = req.file.filename;
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (cedula_emprendedor) {
      fields.push(`cedula_emprendedor = $${idx}`);
      values.push(cedula_emprendedor);
      idx++;
    }
    if (fecha_llevar) {
      fields.push(`fecha_llevar = $${idx}`);
      values.push(fecha_llevar);
      idx++;
    }
    if (id_req !== undefined) {
      fields.push(`id_req = $${idx}`);
      values.push(id_req || null);
      idx++;
    }
    if (req.file) {
      fields.push(`archivo = $${idx}`);
      values.push(nombreArchivo);
      idx++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay datos para actualizar' });
    }

    values.push(id_archivo);

    const queryText = `
      UPDATE requerimiento_archivo
      SET ${fields.join(', ')}
      WHERE id_archivo = $${idx}
      RETURNING *`;

    const resultado = await query(queryText, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const archivoActualizado = resultado.rows[0];
    archivoActualizado.url = `http://localhost:5000/uploads/${path.basename(archivoActualizado.archivo)}`;

    res.json(archivoActualizado);
  } catch (err) {
    console.error('Error en actualizarArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

// Eliminar un archivo por id_archivo
router.delete('/:id_archivo', async (req, res) => {
  try {
    const { id_archivo } = req.params;
    
    const archivoInfo = await query(
      'SELECT archivo FROM requerimiento_archivo WHERE id_archivo = $1',
      [id_archivo]
    );
    
    if (archivoInfo.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const rutaArchivo = path.join(uploadsDir, archivoInfo.rows[0].archivo);
    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }

    const resultado = await query(
      'DELETE FROM requerimiento_archivo WHERE id_archivo = $1 RETURNING *',
      [id_archivo]
    );
    
    res.json({ message: 'Archivo eliminado', archivo: resultado.rows[0] });
  } catch (err) {
    console.error('Error en eliminarArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;