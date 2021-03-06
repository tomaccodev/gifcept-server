import { PassThrough } from 'stream';
import { promisify } from 'util';

import gm, { Dimensions } from 'gm';

export const getSize = (pathToFile: string): Promise<Dimensions> => {
  const image = gm(pathToFile);

  return promisify<Dimensions>(image.size.bind(image))();
};

export const getImagePredominantHexColor = async (pathToFile: string): Promise<string> =>
  new Promise<string>((res, rej) => {
    gm(pathToFile)
      .resize(1, 1)
      .colors(1)
      .stream('histogram', (err, stdout) => {
        if (err) {
          rej(err);
        }

        const writeStream = new PassThrough();
        let strData = '';

        writeStream.on('data', (data) => {
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
        writeStream.on('error', (error) => {
          rej(error);
        });
        stdout.pipe(writeStream);
      });
  });

export const saveFrameFromGif = async (src: string, dest: string): Promise<void> => {
  const image = gm(`${src}[0]`).noProfile();

  await promisify(image.write.bind(image))(dest);
};
