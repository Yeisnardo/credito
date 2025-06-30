const express = require('express');
const router = express.Router();
const requerimientoController = require('../controllers/controlador_requerimiento');

// Crear requerimiento
router.post('/', requerimientoController.createRequerimiento);

// Obtener requerimiento por cédula
router.get('/:cedula_requerimiento', requerimientoController.getRequerimiento);

// Agregar esta línea para actualizar requerimiento
router.put('/:cedula_requerimiento', requerimientoController.updateRequerimiento);
module.exports = router;