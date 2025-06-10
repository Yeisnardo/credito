const express = require('express');
const router = express.Router();
const requerimientoController = require('../controllers/controlador_requerimiento');

router.get('/', requerimientoController.getRequerimientos);
router.get('/:cedula_requerimiento', requerimientoController.getRequerimiento);
router.post('/', requerimientoController.createRequerimiento);
router.put('/:cedula_requerimiento', requerimientoController.updateRequerimiento);
router.delete('/:cedula_requerimiento', requerimientoController.deleteRequerimiento);

module.exports = router;