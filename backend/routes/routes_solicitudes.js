// routes/routes_solicitudes.js
const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/controlador_solicitud');

router.get('/', solicitudController.getSolicitudesComplejas);

module.exports = router;