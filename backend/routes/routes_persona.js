// routes/routes_persona.js
const express = require('express');
const router = express.Router();
const personaController = require('../controllers/controlador_persona');

// Rutas de CRUD para la entcedulaad Persona

// Obtener todas las personas
router.get('/', personaController.getPersonas);

// Obtener una persona por cedula
router.get('/:cedula', personaController.getUnaPersona);

// Crear una nueva persona
router.post('/', personaController.createPersona);

// Actualizar una persona por cedula
router.put('/:cedula', personaController.updatePersona);

// Eliminar una persona por cedula
router.delete('/:cedula', personaController.deletePersona);

module.exports = router;