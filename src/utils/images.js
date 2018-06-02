const { PassThrough } = require('stream');
const gm = require('gm');

module.exports = {
  getSize: pathToFile =>
    new Promise((res, rej) => {
      gm(pathToFile).size((err, size) => {
        if (err) {
          return rej(err);
        }
        return res(size);
      });
    }),
  getImagePredominantHexColor: async pathToFile =>
    new Promise((res, rej) => {
      gm(pathToFile)
        .noProfile()
        .resize(1, 1)
        .colors(16)
        .stream('histogram', (err, stdout) => {
          if (err) {
            rej(err);
          }

          const writeStream = new PassThrough();
          let strData = '';

          writeStream.on('data', data => {
            strData += data.toString();
          });
          writeStream.on('end', () => {
            // strData contains this sample content (at least for imagemagick)
            // comment={
            //          1: (110, 93, 74,  0)    #6E5D4A00
            // }
            const startPattern = '#';
            const endPattern = '}';
            const startIndex = strData.indexOf(startPattern);
            const endIndex = strData.indexOf(endPattern) - 3;

            const hexColor = strData.slice(startIndex, endIndex);
            res(hexColor);
          });
          writeStream.on('error', error => {
            rej(error);
          });
          stdout.pipe(writeStream);
        });
    }),
  saveFrameFromGif: (src, dest) =>
    new Promise((res, rej) => {
      gm(src)
        .noProfile()
        .selectFrame(0)
        .write(dest, err => {
          if (err) {
            return rej(err);
          }
          return res();
        });
    }),
};
