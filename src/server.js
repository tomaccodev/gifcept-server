const path = require('path');
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const errorHandlerFactory = require('@danilupion/server-utils/middlewares/express/errorHandler');
const {
  setup: facebookAuthMiddlewareSetup,
} = require('@danilupion/server-utils/middlewares/express/facebook-auth');
const {
  setup: jwtAuthMiddlewareSetup,
} = require('@danilupion/server-utils/middlewares/express/jwt-auth');
const connectMongoose = require('@danilupion/server-utils/helpers/mongoose');
const { setEnvironment, isDevelopment } = require('@danilupion/server-utils/helpers/env');

const ect = require('ect')();

const config = require('./config.json');

const api = require('./routes/api');
const images = require('./routes/images');
const gifPages = require('./routes/gifPages');

setEnvironment(config.environment);

const PORT = config.server.port;
const CLUSTERED = config.clustered;

const { errorHandler, responseErrorHandler } = errorHandlerFactory(isDevelopment());

const createServerAsync = async () => {
  try {
    const app = express();
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ect');
    app.engine('ect', ect.render);

    // Initialize passport
    app.use(passport.initialize());

    facebookAuthMiddlewareSetup({
      clientId: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    });
    jwtAuthMiddlewareSetup({
      jwtSecret: config.authentication.jwtSecret,
    });

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

    // Register image retrieval routes
    app.use('/', images);

    // Register gif page routes
    app.use('/', gifPages);

    // Serve public/index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Register custom error handler (should registered last be last)
    app.use(errorHandler);

    await connectMongoose(mongoose.connect, config.mongodb);
    app.listen(PORT);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

if (CLUSTERED && cluster.isMaster) {
  // Create a worker for each CPU
  for (let i = 0; i < os.cpus().length; i += 1) {
    cluster.fork();
  }
} else {
  createServerAsync().catch(e => console.log('Error while creating the server', e));
}

process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.error('Caught exception:', err.stack, err);
});

// Respawn dying workers
cluster.on('exit', () => {
  cluster.fork();
});
