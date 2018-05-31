const { parse } = require('url');
const fs = require('fs');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

module.exports = (url, dest) =>
  new Promise((acc, rej) => {
    const { protocol } = parse(url);

    const get = protocol === 'https:' ? https.get : http.get;
    const file = fs.createWriteStream(dest);

    get(url, res => {
      const md5sum = crypto.createHash('md5');

      res.on('data', d => {
        md5sum.update(d);
      });

      res.pipe(file);

      file.on('finish', () => acc(md5sum.digest('hex')));
    }).on('error', err => {
      fs.unlink(dest);
      return rej(err);
    });
  });
