const { PassThrough } = require('stream');
const { promisify } = require('util');
const gm = require('gm');

module.exports = {
  getSize: pathToFile => {
    const image = gm(pathToFile);

    return promisify(image.size.bind(image))();
  },
  getImagePredominantHexColor: async pathToFile =>
    new Promise((res, rej) => {
      gm(pathToFile)
        .resize(1, 1)
        .colors(1)
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
            //          1: (110, 93, 74,  0)    #6E5D4A00 (or #6E5D4A)
            // }
            const startPattern = '#';
            const endPattern = '}';
            const startIndex = strData.indexOf(startPattern);
            const endIndex = strData.indexOf(endPattern) - 1;

            const hexColor = strData.slice(startIndex, endIndex).slice(0, 7);
            res(hexColor);
          });
          writeStream.on('error', error => {
            rej(error);
          });
          stdout.pipe(writeStream);
        });
    }),
  saveFrameFromGif: (src, dest) => {
    const image = gm(src)
      .noProfile()
      .selectFrame(0);

    return promisify(image.write.bind(image))(dest);
  },
};
