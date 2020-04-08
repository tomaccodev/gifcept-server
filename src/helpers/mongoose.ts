import { connect, Mongoose } from 'mongoose';
let connectionPromise: Promise<Mongoose>;

import config from '../../config.json';

export default () => {
  if (connectionPromise === undefined) {
    connectionPromise = connect(
      `mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`,
      {
        useNewUrlParser: true,
        bufferCommands: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
      },
    );
  }

  return connectionPromise;
};
