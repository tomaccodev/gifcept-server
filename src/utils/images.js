const gm = require('gm');
const { createReadStream } = require('fs');

module.exports = {
  getSize: pathToFile =>
    new Promise((acc, rej) => {
      gm(pathToFile).size((err, size) => {
        if (err) {
          return rej(err);
        }
        return acc(size);
      });
    }),
  saveFrameFromGif: (src, dest) => {
    const stream = createReadStream(src);

    return new Promise((acc, rej) => {
      gm(stream)
        .selectFrame(0)
        .write(dest, err => {
          if (err) {
            return rej(err);
          }
          return acc();
        });
    });
  },
};
