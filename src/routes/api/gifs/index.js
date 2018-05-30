const express = require('express');
const fs = require('fs');
const { parse } = require('url');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const path = require('path');
const { v4 } = require('uuid');

const config = require('../../../config');
const {
  NotFound,
  InternalServerError,
  BadRequest,
} = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../plugins/express/jwt-auth');
const userMiddleware = require('../../../plugins/express/user');
const { Gif } = require('../../../models');

const router = new express.Router();

const PAGE_SIZE = 20;

// Helper for downloading gifs
const download = (url, dest) =>
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

router.param('id', async (req, res, next, id) => {
  try {
    const gif = await Gif.findOne({
      _id: id,
    });

    if (!gif) {
      return res.errorHandler(new NotFound());
    }

    req.gif = gif;
    return next();
  } catch (err) {
    return res.errorHandler(err);
  }
});

/**
 * Route: /api/gifs
 * Method: GET
 *
 * Retrieves a list of gifs
 */
router.get('/', async (req, res) => {
  try {
    const gifs = await Gif.find({})
      .limit(PAGE_SIZE)
      .sort({ created: -1 });

    return res.send(gifs);
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/gifs
 * Method: POST
 *
 * Adds a new gif
 */
router.post('/', jwtAuthMiddleware, userMiddleware, async (req, res) => {
  try {
    if (req.body.url) {
      const tempFile = path.join(config.gifsUploadDir, `${v4()}.gif`);

      const md5checksum = await download(req.body.url, tempFile);
      return res.json({
        sucess: true,
        md5checksum,
      });
    }
    return res.errorHandler(new BadRequest());
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

// Loop over files in this folder
fs.readdirSync(__dirname).forEach(file => {
  const fileName = path.basename(file, path.extname(file));
  const filePath = path.join(__dirname, file);

  // Skip index.js
  if (__filename === filePath) {
    return;
  }

  // Register route with the same name as the file
  // eslint-disable-next-line import/no-dynamic-require, global-require
  router.use(`/:season/${fileName}`, require(`./${fileName}`));
});

module.exports = router;
