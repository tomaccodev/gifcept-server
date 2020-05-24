import { Mongoose, connect } from 'mongoose';

import config from '../../config.json';

let connectionPromise: Promise<Mongoose>;

export default (): Promise<Mongoose> => {
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
