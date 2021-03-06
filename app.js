const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser')
const hpp = require('hpp');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/rewiewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
//start express app
const app = express();
const viewRouter = require('./routes/viewRoutes')

//говорим express какой именно шаблонизатор использовать
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
//SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

//----------------1 Global Middlewares-------------
//helmet лучше всего всегда использовать в начале
// Set security http headers

if (process.env.NODE_ENV === 'production') {   

  app.use(helmet());

}


console.log(process.env.NODE_ENV);
//development logging

app.use(
  helmet.contentSecurityPolicy({
  directives: {
  defaultSrc: ["'self'", 'https:', 'http:','data:', 'ws:'],
  baseUri: ["'self'"],
  fontSrc: ["'self'", 'https:','http:', 'data:'],
  scriptSrc: [
  "'self'",
  'https:',
  'http:',
  'blob:'],
  styleSrc: ["'self'", 'https:', 'http:','unsafe-inline']
  }
  })
 );


// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

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
app.use(express.urlencoded({extended:true, limit:'10kb'}))

// Parsing data from cookies
app.use(cookieParser())

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



//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();


  next();
});

//3) ------------Routes------------
//объект после base используем для того, чтобы передать определенные параметры в наш шаблон с которыми будем впоследствии работать в pug. Эти переменные будут называться Locals в pug file
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

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
