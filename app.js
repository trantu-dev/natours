const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const glogalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const viewRouter = require('./routers/viewRouter');
const bookingRouter = require('./routers/bookingRouter');

const app = express();

// SETUP PUG
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

// STATIC FILE
app.use(express.static(`${__dirname}/public`));

// SET HEADER
app.use(helmet());

// LOG REQUEST
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT QUEST
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again in an hour'
});
app.use('/api', limiter);

// BODY PARSER
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());

// ANTI QUERY INJECTION
app.use(mongoSanitize());

// ANTI XSS
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'duration'
    ]
  })
);

// ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

// HANDLER ERROR
app.use(glogalErrorHandler);

module.exports = app;
