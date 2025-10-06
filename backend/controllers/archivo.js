const express = require('express');
const { query } = require('../config/conexion');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '..', 'uploads'); // carpeta donde se guardan los archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Obtener todos los archivos
router.get('/', async (req, res) => {
  try {
    const resultado = await query('SELECT * FROM requerimiento_archivo');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getRequerimientoArchivos:', err);
    res.status(500).json({ message: 'Error al obtener requerimientos de archivos' });
  }
});

// Obtener archivos por id_req
router.get('/byReq/:id_req', async (req, res) => {
  try {
    const { id_req } = req.params;
    const resultado = await query(
      'SELECT * FROM requerimiento_archivo WHERE id_req = $1',
      [id_req]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron archivos para ese requerimiento' });
    }
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en getArchivosPorIdReq:', err);
    res.status(500).json({ message: 'Error en servidor' });
  }
});

// Crear un nuevo archivo (con multer)
router.post('/', upload.single('archivo'), async (req, res) => {
  try {
    // Extraer los campos del cuerpo de la solicitud
    const { cedula_emprendedor, fecha_llevar, id_req } = req.body;

    // Validar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'Archivo es requerido' });
    }

    // Ruta del archivo guardado en el servidor
    const rutaArchivo = req.file.path;

    // Validar que los campos necesarios estén presentes
    if (!cedula_emprendedor || !fecha_llevar || !id_req) {
      return res.status(400).json({ message: 'Campos obligatorios incompletos' });
    }

    // Insertar en la base de datos
    const resultado = await query(
      `INSERT INTO requerimiento_archivo (cedula_emprendedor, archivo, fecha_llevar)
       VALUES ($1, $2, $3) RETURNING *`,
      [cedula_emprendedor, rutaArchivo, fecha_llevar]
    );

    // Responder con los datos insertados
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en crearArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

// Actualizar un archivo existente con opción de subir nuevo archivo
router.put('/:id_archivo', upload.single('archivo'), async (req, res) => {
  try {
    const { id_archivo } = req.params;
    const { cedula_emprendedor, fecha_llevar, id_req } = req.body;

    // Si se subió un nuevo archivo, actualizar la ruta
    let rutaArchivo;
    if (req.file) {
      rutaArchivo = req.file.path;
    }

    // Construir query dinámico
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
    if (id_req) {
      fields.push(`id_req = $${idx}`);
      values.push(id_req);
      idx++;
    }
    if (req.file) {
      fields.push(`archivo = $${idx}`);
      values.push(rutaArchivo);
      idx++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay datos para actualizar' });
    }

    values.push(id_archivo); // valor para WHERE

    const queryText = `
      UPDATE requerimiento_archivo
      SET ${fields.join(', ')}
      WHERE id_archivo = $${idx}
      RETURNING *`;

    const resultado = await query(queryText, values);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en actualizarArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

// Eliminar un archivo por id_archivo
router.delete('/:id_archivo', async (req, res) => {
  try {
    const { id_archivo } = req.params;
    const resultado = await query(
      'DELETE FROM requerimiento_archivo WHERE id_archivo = $1 RETURNING *',
      [id_archivo]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    res.json({ message: 'Archivo eliminado', archivo: resultado.rows[0] });
  } catch (err) {
    console.error('Error en eliminarArchivo:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;