const express = require('express');
const router = express.Router();
const requerimientoEmprendedorController = require('../controllers/controlador_requerimiento_emprendedor');

// POST crear nuevo requerimiento
router.post('/', requerimientoEmprendedorController.createRequerimientoEmprendedor);

// GET obtener requerimiento por id_req
router.get('/:id_req', requerimientoEmprendedorController.getRequerimientoEmprendedor);

module.exports = router;