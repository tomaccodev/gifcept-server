const path = require('path');
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const config = require('./config.json');
const connectMongoose = require('./helpers/mongoose');
const { setEnvironment } = require('./helpers/env');
const { errorHandler, responseErrorHandler } = require('./plugins/express/errorHandler');
const api = require('./routes/api');

setEnvironment(config.environment);

const PORT = config.server.port;

const createServerAsync = async () => {
  try {
    const app = express();

    // Initialize passport
    app.use(passport.initialize());

    // Configure body parser to accept json
    app.use(express.json());

    // Register handler for static assets
    app.use(express.static(path.resolve(__dirname, 'public')));

    // Register HTTP request logger
    app.use(morgan('dev'));

    // Add error handler to responses
    app.use(responseErrorHandler);

    // Register API routes
    app.use('/api', api);

    // Register custom error handler (should registered last be last)
    app.use(errorHandler);

    await connectMongoose();
    app.listen(PORT);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

if (cluster.isMaster) {
  // Create a worker for each CPU
  for (let i = 0; i < os.cpus().length; i += 1) {
    cluster.fork();
  }
} else {
  createServerAsync();
}

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Caught exception:', err.stack, err);
});

// Respawn dying workers
cluster.on('exit', () => {
  cluster.fork();
});
