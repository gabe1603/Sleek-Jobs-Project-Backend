const { prisma } = require('../config/prisma');
const { AppError } = require('../middlewares/errorHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

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
        role: role || 'CANDIDATE'
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
  try {
    const { userId } = req.params;
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
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
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