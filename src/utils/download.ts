import { createHash } from 'crypto';
import { createWriteStream, unlink } from 'fs';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';
import { parse } from 'url';

export const downloadFile: (url: string, dest: string) => Promise<string> = async (url, dest) =>
  new Promise((acc, rej) => {
    const { protocol } = parse(url);

    const get = protocol === 'https:' ? httpsGet : httpGet;
    const file = createWriteStream(dest);

    get(url, (res) => {
      const md5sum = createHash('md5');

      res.on('data', (d) => {
        md5sum.update(d);
      });

      res.pipe(file);

      file.on('finish', () => acc(md5sum.digest('hex')));
    }).on('error', (err) => {
      unlink(dest, () => {
        return rej(err);
      });
    });
  });
