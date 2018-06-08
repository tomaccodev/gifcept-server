const { stat, rename, createReadStream, createWriteStream } = require('fs');
const { promisify } = require('util');

module.exports = {
  getFileSize: pathToFile => promisify(stat)(pathToFile).then(stats => stats.size),
  move: (src, dest) => promisify(rename)(src, dest),
  copy: (src, dest) =>
    new Promise((res, rej) => {
      const srcStream = createReadStream(src);
      const destStream = createWriteStream(dest);

      srcStream.on('end', res);
      srcStream.on('error', rej);
      srcStream.pipe(destStream);
    }),
};
