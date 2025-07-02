const express = require('express');
const router = express.Router();
const personaController = require('../controllers/controlador_persona');

router.get('/', personaController.getPersonas);
router.get('/:cedula', personaController.getUnaPersona);
router.post('/', personaController.createPersona);
router.put('/:cedula', personaController.updatePersona);
router.delete('/:cedula', personaController.deletePersona);

module.exports = router;