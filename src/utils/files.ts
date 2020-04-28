import { createHash } from 'crypto';
import { createReadStream, createWriteStream, rename, stat, unlink } from 'fs';
import { promisify } from 'util';

const promisifiedStat = promisify(stat);

const promisifiedRename = promisify(rename);

const promisifiedUnlink = promisify(unlink);

export const getFileSize = (pathToFile: string) =>
  promisifiedStat(pathToFile).then((stats) => stats.size);

export const move = (src: string, dest: string) => promisifiedRename(src, dest);

export const remove = (src: string) => promisifiedUnlink(src);

export const copy = (src: string, dest: string) =>
  new Promise((res, rej) => {
    const srcStream = createReadStream(src);
    const destStream = createWriteStream(dest);

    srcStream.on('end', res);
    srcStream.on('error', rej);
    srcStream.pipe(destStream);
  });

export const md5hash: (src: string) => Promise<string> = (src) =>
  new Promise((acc, rej) => {
    const file = createReadStream(src);
    const md5sum = createHash('md5');

    file.on('end', () => acc(md5sum.digest('hex')));
    file.on('error', (err) => rej(err));
    file.pipe(md5sum);
  });
