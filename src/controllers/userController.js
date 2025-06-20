const { prisma } = require('../config/prisma');
const { AppError } = require('../middlewares/errorHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    let { role } = req.body;
    // Validação e normalização do role
    const allowedRoles = ['admin', 'employer', 'student'];
    role = (role || 'student').toLowerCase();
    if (!allowedRoles.includes(role)) {
      return next(new AppError('Role inválida. Use admin, employer ou student.', 400));
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(new AppError('Este email já está em uso.', 400));
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    // Gerar token
    const token = signToken(user.id);

    // Remover senha do objeto de resposta
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e senha existem
    if (!email || !password) {
      return next(new AppError('Por favor, forneça email e senha.', 400));
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Email ou senha incorretos.', 401));
    }

    // Gerar token
    const token = signToken(user.id);

    // Remover senha do objeto de resposta
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        company: true,
        skills: true,
        cv: true
      }
    });

    if (!user) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        email
      }
    });

    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Retorna a empresa vinculada ao usuário empregador
exports.getUserCompany = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    if (!user.company) {
      return res.status(404).json({ error: 'Usuário não possui empresa vinculada.' });
    }
    res.json(user.company);
  } catch (error) {
    next(error);
  }
};

// Retorna os dados do usuário pelo ID
exports.getUserById = async (req, res, next) => {
  logger.log('GET /api/users/:userId called', { params: req.params, userAuth: req.user });
  try {
    const { userId } = req.params;
    logger.log('Buscando usuário por ID:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        abn: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });
    logger.log('Resultado da busca:', user);
    if (!user) {
      logger.log('Usuário não encontrado para ID:', userId);
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Erro ao buscar usuário por ID:', error);
    next(error);
  }
};

// Upload de avatar do usuário
exports.uploadAvatar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const avatarPath = `/uploads/${req.file.filename}`;
    await prisma.user.update({
      where: { id },
      data: { avatar: avatarPath }
    });
    res.json({ url: avatarPath });
  } catch (error) {
    next(error);
  }
};

// Atualiza informações do usuário pelo ID
exports.updateUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    logger.log('Requisição PATCH /api/users/:userId', { userId, body: req.body, userAuth: req.user });
    // Permitir apenas o próprio usuário ou admin editar
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      logger.log('Acesso negado para userId:', req.user.id);
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.email) data.email = req.body.email;
    // Só permite editar abn se for EMPLOYER
    if (req.body.abn && req.user.role && req.user.role.toUpperCase() === 'EMPLOYER') {
      data.abn = req.body.abn;
    }
    logger.log('Dados para update:', data);
    const user = await prisma.user.update({
      where: { id: userId },
      data
    });
    logger.log('Usuário atualizado:', user);
    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        companyId: true,
        abn: true,
        skills: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}; 