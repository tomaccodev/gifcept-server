const path = require('path');
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const ect = require('ect')();

const config = require('./config.json');
const connectMongoose = require('./helpers/mongoose');
const { setEnvironment } = require('./helpers/env');
const { errorHandler, responseErrorHandler } = require('./middlewares/express/errorHandler');
const api = require('./routes/api');
const images = require('./routes/images');
const gifPages = require('./routes/gifPages');

setEnvironment(config.environment);

const PORT = config.server.port;

const createServerAsync = async () => {
  try {
    const app = express();
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ect');
    app.engine('ect', ect.render);

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

process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.error('Caught exception:', err.stack, err);
});

// Respawn dying workers
cluster.on('exit', () => {
  cluster.fork();
});
