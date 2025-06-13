const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/controlador_solicitud');

// Rutas de solicitud
router.get('/', solicitudController.getSolicitudes); // Obtener todas las solicitudes
router.get('/:cedula_solicitud', solicitudController.getSolicitudPorCedula); // Obtener solicitud por cédula
router.post('/', solicitudController.createSolicitud); // Crear solicitud
router.put('/:cedula_solicitud', solicitudController.updateSolicitud); // Actualizar solicitud
router.delete('/:cedula_solicitud', solicitudController.deleteSolicitud); // Eliminar solicitud

module.exports = router;