const express = require('express');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Aplicar para uma vaga
router.post('/:jobId/apply', applicationController.applyToJob);

// Listar aplicações de um usuário
router.get('/user/:userId', applicationController.getUserApplications);

module.exports = router; 