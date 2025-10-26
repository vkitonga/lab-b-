const express = require('express');
const config = require('./config/config');
const db = require('./models');
const morgan = require('morgan');
const winston = require('winston');

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');

const app = express();

const {combine, timestamp, json} = winston.format;
const logger = winston.createLogger({
  level: 'http',
  format: combine(timestamp({format:'YYYY-MM-DD hh:mm:ss.SSS A'}), json()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'logs' })]
});

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
      remote_address: tokens['remote-addr'](req, res),
      date: tokens.date(req, res),
      user_agent: tokens['user-agent'](req, res)
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http('incoming-request', data);
      }
    }
  }
);

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/orders', orderRoutes);

db.sequelize.sync().then(() => {
  app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
  });
});