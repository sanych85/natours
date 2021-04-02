const AppError = require("../utils/appError");

const handleCastErrorDB = (err)=> {
const message = `Invalid ${err.path}: ${err.value}`
return new AppError(message, 400)
}
const handleDuplicateFieldsDB =(err)=> {

  const value = err.keyValue.name
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate fileld value: ${value}. Please use another value!`

  return new AppError(message,400)
}

const handleValidationErrorDB = (err)=> {
  const errors  = Object.values(err.errors).map(val=> val.message)
  const message  = `Invalid input data. ${errors.join('.')}`
  return new AppError(message, 400)
}
const handleJWTError = ()=> {
 return new AppError('Invalid tokin. Please log in again', 401) 
}

const handleJWTExpiredError = ()=> {
  return new AppError('your token is expired! Please log again', 401)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};
const sendErrorProd = (err, res) => {
  //operational trusted send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Programming or other unknown error dont leak error details
  else {
    //1) Log error
   
    // 2_ send generic message

    res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    })
  }
};
module.exports = (err, req, res, next) => {
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
 
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
   
    let error = {...err}
    
    // Обработка ошибок для cast error
    if(err.name==="CastError") error = handleCastErrorDB(error)
    
    
    // обработка ошибок для дублирования кода в mongoose
    if(error.code ===11000) {
    
      error = handleDuplicateFieldsDB(error)
    }
    if(error.name==="ValidationError") {
      error = handleValidationErrorDB(error)
    }
    if(error.name === "JsonWebTokenError")error = handleJWTError()
    if(error.name==="TokenExpiredError")error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};