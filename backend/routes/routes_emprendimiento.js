const express = require('express');
const router = express.Router();
const emprendimientoController = require('../controllers/controlador_emprendimiento');

router.get('/', emprendimientoController.getEmprendimientos); // GET all
router.get('/:cedula_emprendedor', emprendimientoController.getUnaEmprendimiento); // GET one
router.post('/', emprendimientoController.createEmprendimiento); // POST new
router.put('/:cedula_emprendedor', emprendimientoController.updateEmprendimiento); // PUT update
router.delete('/:cedula_emprendedor', emprendimientoController.deleteEmprendimiento); // DELETE

module.exports = router;