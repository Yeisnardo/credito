const express = require('express');
const router = express.Router();
const fondoController = require('../controllers/controlador_fondo');


router.get('/', fondoController.getFondos);
router.post('/', fondoController.createFondo);

module.exports = router;