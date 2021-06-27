const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate fileld value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `Invalid input data. ${errors.join('.')}`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  return new AppError('Invalid tokin. Please log in again', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('your token is expired! Please log again', 401);
};

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    //Rendered website
    res.status(err.statusCode).render('error', {
      title: 'something went wrong!',
      msg: err.message,
    });
  }
};
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    //operational trusted send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming or other unknown error dont leak error details
    else {
      //1) Log error
      console.error('ERROR' ,err)
      // 2_ send generic message

      return res.status(500).json({
        status: 'error',
        message: 'something went wrong',
      });
    }
  }
  else {
    //RENDERED WEBSITE
    if (err.isOperational) {
     return  res.status(err.statusCode).render('error',{
        title: 'something went wrong',
        msg:'Please try again later',
      });
    }
    //Programming or other unknown error dont leak error details
    else {
      //1) Log error

      // 2_ send generic message

      return  res.status(err.statusCode).json({
        title: 'something went wrong',
        msg: "Please try agein later",
      });
    }
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
        error.message= err.message
    // Обработка ошибок для cast error
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    // обработка ошибок для дублирования кода в mongoose
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
