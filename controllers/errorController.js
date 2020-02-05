const AppError = require('./../utils/appError');

const handleCastErrDB = err => {
  const message = `Mega Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/"(.*?)"/)[1];
  const message = `Duplicate value: ${value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(e => e.message);
  const message = errors.join('. ');
  return new AppError(message, 400);
};
const handleJWTError = () => {
  return new AppError('Invalid token. Please login again', 401);
};
const handleTokenExpiredError = () => {
  return new AppError('Token expired. Please login again', 401);
};

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    // RENDER WEB
    res.status(err.statusCode).render('error', {
      title: 'Somthing went wrong',
      msg: err.message
    });
  }
};
const sendErrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // API
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    console.error('ERROR:', err);

    return res.status(err.statusCode).json({
      status: err.status,
      message: 'Somthing went wrong!'
    });
  }
  // RENDER WEB
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Somthing went wrong',
      msg: err.message
    });
  }
  console.error('ERROR:', err);

  return res.status(err.statusCode).render('error', {
    title: 'Somthing went wrong',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  error.message = err.message;

  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'CastError') error = handleCastErrDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
  if (error.name === 'JsonWebTokenError') error = handleJWTError();

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrProd(error, req, res);
  }
};
