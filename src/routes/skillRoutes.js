const express = require('express');
const skillController = require('../controllers/skillController');

const router = express.Router();

router.get('/', skillController.getAllSkills);
router.get('/user/:userId', skillController.getUserSkills);

module.exports = router; 