const express = require('express');
const path = require('path');
const multer = require('multer');
const { query } = require('../config/conexion');

const router = express.Router();

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo JPG, PNG o GIF.'));
    }
  },
});

// Ruta para crear depósito con comprobante
router.post('/', upload.single('comprobante'), async (req, res) => {
  try {
    const { cedula_emprendedor, estado } = req.body;
    const comprobantePath = req.file ? `/uploads/${req.file.filename}` : null;

    const resultado = await query(
      `INSERT INTO deposito (cedula_emprendedor, comprobante, estado)
       VALUES ($1, $2, $3) RETURNING *`,
      [cedula_emprendedor, comprobantePath, estado]
    );

    res.status(201).json({
      ...resultado.rows[0],
      comprobante: comprobantePath,
    });
  } catch (error) {
    console.error('Error en createDeposito:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener depósitos por cédula
router.get('/cedula/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const resultado = await query(
      `SELECT * FROM deposito WHERE cedula_emprendedor = $1`,
      [cedula_emprendedor]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener depósitos:', error);
    res.status(500).json({ error: 'Error al obtener depósitos' });
  }
});

// Ruta para obtener todos los depósitos
router.get('/', async (req, res) => {
  try {
    const resultado = await query(`
      SELECT d.*, p.nombre_completo
      FROM deposito d
      LEFT JOIN persona p ON d.cedula_emprendedor = p.cedula
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener depósitos:', error);
    res.status(500).json({ error: 'Error al obtener depósitos' });
  }
});

// Ruta para actualizar el estado de todos los depósitos por cédula_emprendedor
router.put('/cedula/:cedula_emprendedor', async (req, res) => {
  try {
    const { cedula_emprendedor } = req.params;
    const { estado } = req.body; // solo el campo estado

    if (!estado) {
      return res.status(400).json({ error: 'El campo estado es obligatorio' });
    }

    const resultado = await query(
      `UPDATE deposito
       SET estado = $1
       WHERE cedula_emprendedor = $2
       RETURNING *`,
      [estado, cedula_emprendedor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron depósitos con esa cédula' });
    }

    res.json({ message: 'Depósitos actualizados', deposits: resultado.rows });
  } catch (error) {
    console.error('Error al actualizar depósitos por cédula:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;