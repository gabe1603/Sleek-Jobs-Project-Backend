const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { prisma } = require('../config/prisma');

const protect = async (req, res, next) => {
  try {
    // 1) Verificar se o token existe
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Você não está logado. Por favor, faça login para ter acesso.', 401));
    }

    // 2) Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(new AppError('O usuário não existe mais.', 401));
    }

    // 4) Adicionar o usuário ao request
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Token inválido ou expirado.', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
}; 