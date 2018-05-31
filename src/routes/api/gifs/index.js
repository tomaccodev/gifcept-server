const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4 } = require('uuid');

const config = require('../../../config');
const {
  NotFound,
  InternalServerError,
  BadRequest,
} = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');
const userMiddleware = require('../../../middlewares/express/user');
const { Gif, GifFile } = require('../../../models');
const download = require('../../../utils/download');
const { getSize } = require('../../../utils/images');
const { getFileSize } = require('../../../utils/files');
const { saveFrameFromGif } = require('../../../utils/images');

const router = new express.Router();

const PAGE_SIZE = 20;

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
      const tempPath = path.join(config.uploadDir, `${v4()}.gif`);

      const md5checksum = await download(req.body.url, tempPath);
      let gifFile = await GifFile.findOne({ md5checksum });

      if (!gifFile) {
        const { width, height } = await getSize(tempPath);
        const fileSize = await getFileSize(tempPath);
        const framePath = path.join(
          config.uploadDir,
          `${path.basename(tempPath, path.extname(tempPath))}.png`,
        );

        await saveFrameFromGif(tempPath, framePath);
        const frameFileSize = await getFileSize(framePath);

        gifFile = await GifFile.create({
          md5checksum,
          width,
          height,
          fileSize,
          frameFileSize,
          importationUrls: [
            {
              url: req.body.url,
            },
          ],
        });
      } else if (!gifFile.importationUrls.some(i => i.url === req.body.url)) {
        gifFile.importationUrls.push({
          url: req.body.url,
        });

        await gifFile.save();
      }

      const gif = await Gif.create({
        gifFile,
        user: req.user,
      });

      return res.json(gif.toJSON());
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
  router.use(`/:id/${fileName}`, require(`./${fileName}`));
});

module.exports = router;
