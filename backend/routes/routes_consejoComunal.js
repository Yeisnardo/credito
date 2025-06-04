const express = require('express');
const router = express.Router();
const consejoController = require('../controllers/cotrolador_consejoComunal');

router.get('/', consejoController.obtenerConsejos);
router.get('/:cedula_persona', consejoController.obtenerUnConsejo);
router.post('/', consejoController.crearConsejo);
router.put('/:cedula_persona', consejoController.actualizarConsejo);
router.delete('/:cedula_persona', consejoController.eliminarConsejo);

module.exports = router;