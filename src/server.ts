/* tslint:disable:no-console */
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import config from '../config.json';

import connectMongoose from './helpers/mongoose';
import errorHandler from './middleware/express/errorHandler';
import notFoundHandler from './middleware/express/notFoundHandler';
import routes from './routes';

const app = express();

const startServer = async () => {
  // Configure body parser to accept json
  app.use(express.json());

  // Configure some security headers
  app.use(helmet());

  // Register handler for static assets
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Register HTTP request logger
  app.use(morgan('dev'));

  // Register routes
  app.use('/', routes);

  // Serve public/index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Register custom not found handler
  app.use(notFoundHandler);

  // Register custom error handler (should registered last be last)
  app.use(errorHandler);

  await connectMongoose();
  app.listen(config.server.port);
  console.error(`Listening in port ${config.server.port}`);
};

startServer().catch((e) => console.log('Error while creating the server', e));

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Caught exception:', err.stack, err);
});
