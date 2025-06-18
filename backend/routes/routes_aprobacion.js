const express = require('express');
const router = express.Router();
const aprobacionController = require('../controllers/controlador_aprobacion');

router.get('/', aprobacionController.getAprobaciones);
router.post('/', aprobacionController.crearAprobacion);

module.exports = router;