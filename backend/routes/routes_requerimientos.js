const express = require('express');
const router = express.Router();
const requerimientoController = require('../controllers/controlador_requerimientos');

// Obtener todos los requerimientos
router.get('/', requerimientoController.getRequerimientos);

// Crear un nuevo requerimiento
router.post('/', requerimientoController.createRequerimiento);

// Actualizar un requerimiento por ID
router.put('/:id', requerimientoController.updateRequerimiento);

// Eliminar un requerimiento por ID
router.delete('/:id', requerimientoController.deleteRequerimiento);

module.exports = router;