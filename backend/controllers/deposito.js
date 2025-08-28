// controllers/deposito.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const { query } = require('../config/conexion'); // Asegúrate que esta ruta sea correcta

const router = express.Router();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ruta absoluta a la carpeta uploads
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Configuración de multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo JPG, PNG o GIF.'));
    }
  },
});

// Ruta para registrar depósito con comprobante
router.post(
  '/',
  upload.single('comprobante'), // 'comprobante' es el campo en FormData
  async (req, res) => {
    try {
      const { cedula_emprendedor, estado } = req.body;
      const comprobantePath = req.file
        ? `/uploads/${req.file.filename}` // La ruta relativa que el cliente usará para acceder
        : null;

      const resultado = await query(
        `INSERT INTO deposito (
          cedula_emprendedor,
          comprobante,
          estado
        ) VALUES ($1, $2, $3) RETURNING *`,
        [cedula_emprendedor, comprobantePath, estado]
      );

      res.status(201).json({
        ...resultado.rows[0],
        comprobante: comprobantePath, // Para que cliente sepa cómo acceder
      });
    } catch (error) {
      console.error('Error en createDeposito:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

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

module.exports = router;