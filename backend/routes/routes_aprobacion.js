// routes/aprobacion.js
const express = require('express');
const router = express.Router();
const aprobacionController = require('../controllers/controlador_aprobacion');

// Ruta para obtener todas las aprobaciones
router.get('/', aprobacionController.getAprobaciones);

module.exports = router;