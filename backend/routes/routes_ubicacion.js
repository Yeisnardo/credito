const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/controlador_ubicacion');

router.get('/', ubicacionController.obtenerUbicaciones);
router.get('/:cedula_persona', ubicacionController.obtenerUnaUbicacion);
router.post('/', ubicacionController.crearUbicacion);
router.put('/:cedula_persona', ubicacionController.actualizarUbicacion);
router.delete('/:cedula_persona', ubicacionController.eliminarUbicacion);

module.exports = router;