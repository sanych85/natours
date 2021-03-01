const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();
//1 Middlewares
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req,res,next)=> {

  // const err = new Error(`Cant find ${req.originalUrl} on this server`)
  // err.status = 'fail';
  // err.statusCode = 404
  // next(err)
  next(new appError(`Cant find ${req.originalUrl} on this server`,404))
})

//определение middleware Для обработки ошибок
app.use(globalErrorHandler)
module.exports = app;
