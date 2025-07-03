const express = require('express');
const router = express.Router();
const requerimientoController = require('../controllers/controlador_required');

router.get('/', requerimientoController.getRequerimientos);
router.get('/:id_req', requerimientoController.getRequerimientoById);
router.post('/', requerimientoController.createRequerimiento);
router.put('/:id_req', requerimientoController.updateRequerimiento);
router.delete('/:id_req', requerimientoController.deleteRequerimiento);

module.exports = router;