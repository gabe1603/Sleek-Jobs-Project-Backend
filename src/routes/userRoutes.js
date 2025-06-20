const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const jobController = require('../controllers/jobController');
const { protect } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validateRequest');
const upload = require('../middlewares/upload');

const router = express.Router();

// Rotas públicas
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('A senha deve ter no mínimo 6 caracteres'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    validateRequest
  ],
  userController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
    validateRequest
  ],
  userController.login
);

// Rotas protegidas
router.use(protect);

router.get('/profile', userController.getProfile);
router.patch(
  '/profile',
  [
    body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    validateRequest
  ],
  userController.updateProfile
);

// Rota para buscar a empresa vinculada ao usuário empregador
router.get('/:userId/company', userController.getUserCompany);

// Rota para buscar os dados do usuário pelo ID
router.get('/:userId', userController.getUserById);

// Rota protegida para upload de avatar
router.post('/:id/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

// Rota para buscar todas as vagas criadas por um usuário
router.get('/:userId/jobs', jobController.getJobsByCreator);

module.exports = router; 