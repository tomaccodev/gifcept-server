const express = require('express');
const path = require('path');
const { v4 } = require('uuid');

const {
  InternalServerError,
  BadRequest,
} = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const {
  middleware: jwtAuthMiddleware,
} = require('@danilupion/server-utils/middlewares/express/jwt-auth');

const config = require('../../../config');
const { gifQueryMetadataFromRequest } = require('../../../utils/search');
const userMiddleware = require('../../../middlewares/express/user');
const { Gif, GifFile } = require('../../../models');
const download = require('../../../utils/download');
const { getSize } = require('../../../utils/images');
const { getFileSize, move } = require('../../../utils/files');
const { saveFrameFromGif, getImagePredominantHexColor } = require('../../../utils/images');

const router = new express.Router();

/**
 * Route: /api/users/:id/gifs
 * Method: GET
 *
 * Retrieves a list of gifs
 */
router.get('/', async (req, res) => {
  try {
    const gifs = await Gif.normalizedQuery(gifQueryMetadataFromRequest(req));

    return res.send(await Promise.all(gifs.map(g => g.serialize())));
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/users/:id/gifs
 * Method: POST
 *
 * Adds a new gif
 */
router.post('/', jwtAuthMiddleware, userMiddleware, async (req, res) => {
  try {
    if (!req.body.url) {
      return res.errorHandler(new BadRequest());
    }

    const tempPath = path.join(config.dirs.uploadDir, `${v4()}.gif`);

    const md5checksum = await download(req.body.url, tempPath);
    let gifFile = await GifFile.findOne({ md5checksum });

    if (!gifFile) {
      const { width, height } = await getSize(tempPath);
      const fileSize = await getFileSize(tempPath);
      const framePath = path.join(
        config.dirs.uploadDir,
        `${path.basename(tempPath, path.extname(tempPath))}.png`,
      );

      await saveFrameFromGif(tempPath, framePath);
      const frameFileSize = await getFileSize(framePath);

      gifFile = await GifFile.create({
        md5checksum,
        width,
        height,
        color: await getImagePredominantHexColor(framePath),
        fileSize,
        frameFileSize,
        importationUrls: [
          {
            url: req.body.url,
          },
        ],
      });

      await Promise.all([
        // eslint-disable-next-line no-underscore-dangle
        move(tempPath, path.join(config.dirs.gifsDir, `${gifFile._id}.gif`)),
        // eslint-disable-next-line no-underscore-dangle
        move(framePath, path.join(config.dirs.gifsDir, `${gifFile._id}.png`)),
      ]);
    } else if (!gifFile.importationUrls.some(i => i.url === req.body.url)) {
      gifFile.importationUrls.push({
        url: req.body.url,
      });

      await gifFile.save();
    }

    const gif = await Gif.create({
      gifFile,
      color: gifFile.color,
      user: req.user,
    });

    return res.json(await gif.serialize());
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
