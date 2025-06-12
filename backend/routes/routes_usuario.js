const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/controlador_usuario');
const verificarEstatusUsuario = require('../middlewares/verificarEstatus');

// Rutas de usuario
router.get('/', usuarioController.getUsuario);
router.get('/:cedula_usuario', usuarioController.getUsuarioPorCedula);
router.post('/', usuarioController.createUsuario);
router.post('/login', usuarioController.loginUsuario);
router.put('/:cedula_usuario', usuarioController.updateUsuario);
router.delete('/:cedula_usuario', usuarioController.deleteUsuario);
router.put('/:cedula_usuario/estatus', usuarioController.updateEstatusUsuario);

// Ruta protegida
router.get('/perfil', verificarEstatusUsuario, (req, res) => {
  res.json({ message: 'Acceso permitido', usuario: req.usuario });
});

module.exports = router;