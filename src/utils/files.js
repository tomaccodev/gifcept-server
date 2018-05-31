const { stat, rename } = require('fs');
const { promisify } = require('util');

module.exports = {
  getFileSize: pathToFile => promisify(stat)(pathToFile).then(stats => stats.size),
  move: (src, dest) => promisify(rename)(src, dest),
};
