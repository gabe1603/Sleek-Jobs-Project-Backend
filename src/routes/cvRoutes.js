const express = require('express');
const cvController = require('../controllers/cvController');

const router = express.Router();

router.get('/:userId', cvController.getCV);
router.post('/', cvController.upsertCV);

module.exports = router; 