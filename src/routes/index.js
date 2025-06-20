const express = require('express');
const userRoutes = require('./userRoutes');
const jobRoutes = require('./jobRoutes');
const authRoutes = require('./authRoutes');
const cvRoutes = require('./cvRoutes');
const applicationRoutes = require('./applicationRoutes');
const skillRoutes = require('./skillRoutes');
const companyRoutes = require('./companyRoutes');

const router = express.Router();

// Rotas de usuário
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/auth', authRoutes);
router.use('/cv', cvRoutes);
router.use('/applications', applicationRoutes); // Corrigido para usar /applications como base
router.use('/skills', skillRoutes);
router.use('/companies', companyRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando corretamente'
  });
});

module.exports = router; 