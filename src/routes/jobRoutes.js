const express = require('express');
const jobController = require('../controllers/jobController');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/:id/image', upload.single('image'), jobController.uploadJobImage);
router.post('/', protect, jobController.createJob);

module.exports = router; 