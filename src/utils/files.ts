import { createReadStream, createWriteStream, rename, stat } from 'fs';
import { promisify } from 'util';

export const getFileSize = (pathToFile: string) =>
  promisify(stat)(pathToFile).then((stats) => stats.size);

export const move = (src: string, dest: string) => promisify(rename)(src, dest);

export const copy = (src: string, dest: string) =>
  new Promise((res, rej) => {
    const srcStream = createReadStream(src);
    const destStream = createWriteStream(dest);

    srcStream.on('end', res);
    srcStream.on('error', rej);
    srcStream.pipe(destStream);
  });
