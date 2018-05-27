const mongoose = require('mongoose');

const config = require('../config.json');

mongoose.Promise = Promise;

let connectionPromise = null;

const MONGODB_URI = `mongodb://${config.mongodb.host}:${config.mongodb.port}/${
  config.mongodb.database
}`;

module.exports = () => {
  if (connectionPromise === null) {
    connectionPromise = mongoose.connect(MONGODB_URI);
  }

  return connectionPromise;
};
