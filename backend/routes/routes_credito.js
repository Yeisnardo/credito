// src/routes/credito.js
const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/controlador_credito');

router.get('/', creditoController.getCreditos);
router.post('/', creditoController.crearCredito);
router.get('/cedula_credito/:cedula_credito', creditoController.getCreditosPorCedula);
router.put('/actualizar-estatus/:cedula_credito', creditoController.actualizarEstatusCredito);

module.exports = router;