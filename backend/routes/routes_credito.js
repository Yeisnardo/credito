// routes/credito.js
const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/controlador_credito');

router.get('/', creditoController.getCreditos);
router.post('/', creditoController.crearCredito);

module.exports = router;