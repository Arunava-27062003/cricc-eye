const cors = require('cors');
const express = require('express');

const { env } = require('./config/env');
const { errorHandler } = require('./middleware/error-handler');
const { authRouter } = require('./routes/auth');
const { cricketRouter } = require('./routes/cricket');
const { healthRouter } = require('./routes/health');
const { usersRouter } = require('./routes/users');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    })
  );
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/cricket', cricketRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
