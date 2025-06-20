const express = require('express');
const companyController = require('../controllers/companyController');

const router = express.Router();

router.get('/:companyId', companyController.getCompanyById);

module.exports = router; 