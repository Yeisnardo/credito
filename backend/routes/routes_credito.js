const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/controlador_credito');

router.get('/', creditoController.getCreditos);

module.exports = router;
