const express = require('express');
const router = express.Router();
const emprendimientoController = require('../controllers/controlador_emprendimiento');

// Obtener todos los emprendimientos
router.get('/', emprendimientoController.getEmprendimientos);

// Obtener un emprendimiento por ID
router.get('/:cedula_emprendedor', emprendimientoController.getUnaEmprendimiento);

// Crear un nuevo emprendimiento
router.post('/', emprendimientoController.createEmprendimiento);

// Actualizar un emprendimiento por cedula_emprendedor
router.put('/:cedula_emprendedor', emprendimientoController.updateEmprendimiento);

// Eliminar un emprendimiento por cedula_emprendedor
router.delete('/:cedula_emprendedor', emprendimientoController.deleteEmprendimiento);

module.exports = router;