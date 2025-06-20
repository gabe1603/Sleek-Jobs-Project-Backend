const { ValidationError } = require('express-validator');
const { Prisma } = require('@prisma/client');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro no banco de dados',
        error: err.message,
        stack: err.stack
      });
    }

    if (err instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro de validação',
        errors: err.array()
      });
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  // Produção
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Erros de programação: não vazar detalhes do erro
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Algo deu errado!'
  });
};

module.exports = {
  AppError,
  errorHandler
}; 