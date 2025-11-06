const express = require('express');
const multer = require('multer');
const { 
  crearRespaldo, 
  restaurarBaseDatos, 
  descargarUltimoRespaldo, 
  obtenerHistorialRespaldos, 
  eliminarRespaldo 
} = require('../controllers/backup');

const router = express.Router();

// Configuración de multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Crear respaldo
router.post('/create', async (req, res) => {
  await crearRespaldo(req, res);
});

// Restaurar base de datos
router.post('/restore', upload.single('backup_file'), async (req, res) => {
  await restaurarBaseDatos(req, res);
});

// Obtener historial de respaldos
router.get('/history', async (req, res) => {
  await obtenerHistorialRespaldos(req, res);
});

// Descargar último respaldo
router.get('/download/latest', async (req, res) => {
  await descargarUltimoRespaldo(req, res);
});

// Eliminar respaldo
router.delete('/:id', async (req, res) => {
  await eliminarRespaldo(req, res);
});

module.exports = router;