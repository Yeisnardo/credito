const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/controlador_perfil');

// Aquí puedes definir las rutas necesarias
router.get('/', perfilController.getPerfiles);
router.get('/:cedula', perfilController.getPerfil);
router.post('/', perfilController.createPerfil);
router.put('/:cedula', perfilController.updatePerfil);
router.delete('/:cedula', perfilController.deletePerfil);

module.exports = router;