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
    if (Prisma && Prisma.PrismaClientKnownRequestError && err instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        status: 'error',
        message: 'Database error',
        error: err.message,
        stack: err.stack
      });
    }

    if (typeof ValidationError === 'function' && err instanceof ValidationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
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

  // Production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown errors: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

module.exports = {
  AppError,
  errorHandler
}; 