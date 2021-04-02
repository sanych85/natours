const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/rewiewRoutes')
const app = express();
//1 Global Middlewares
//helmet лучше всего всегда использовать в начале
// Set security http headers
app.use(helmet());

console.log(process.env.NODE_ENV);
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit request from same API
const limiter = rateLimit({
  //нижняя запись говорит, что мы позволяем сделать 100 запросов с одного IP в течении одного часа
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Try again in 1 hour',
});
//используем limiter Только для всех маршрутов, которые начинаются с api
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// DATA SANITIZATION AGAINSt NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINSt XSS
// помогает очистить наш input от всякого вредоносного кода
app.use(xss());

//Предотвращает загрязнение параметров
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)

  next();
});
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant find ${req.originalUrl} on this server`)
  // err.status = 'fail';
  // err.statusCode = 404
  // next(err)
  next(new appError(`Cant find ${req.originalUrl} on this server`, 404));
});

//определение middleware Для обработки ошибок
app.use(globalErrorHandler);
module.exports = app;
