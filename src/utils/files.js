const { stat } = require('fs');
const { promisify } = require('util');

module.exports = {
  getFileSize: pathToFile => promisify(stat)(pathToFile).then(stats => stats.size),
};
