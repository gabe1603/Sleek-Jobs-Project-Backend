const express = require('express');
const companyController = require('../controllers/companyController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/:companyId', companyController.getCompanyById);
router.post('/', upload.single('logo'), companyController.createCompany);

module.exports = router; 