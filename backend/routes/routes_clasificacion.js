const express = require('express');
const router = express.Router();
const clasificacionController = require('../controllers/controlador_clasificacion');

// Obtener todas las clasificaciones
router.get('/', clasificacionController.getClasificaciones);

// Crear una nueva clasificación
router.post('/', clasificacionController.createClasificacion);

// Actualizar una clasificación por id
router.put('/:id_clasificacion', clasificacionController.updateClasificacion);

module.exports = router;