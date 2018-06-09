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
const { getFileSize, move } = require('../../../utils/files');
const { saveFrameFromGif, getImagePredominantHexColor } = require('../../../utils/images');

const router = new express.Router();

const PAGE_SIZE = config.pageSizes.gifs;

const serializeGif = async gif => {
  await gif.populate('user').execPopulate();

  const {
    id,
    color,
    description,
    user,
    created,
    comments,
    views,
    likes,
    shares,
    tags,
  } = gif.toJSON();

  return {
    id,
    color,
    description,
    user: {
      id: user.id,
      username: user.username,
    },
    created,
    comments: [],
    commentsCount: comments.length,
    likes: [],
    likesCount: likes.length,
    shares: [],
    sharesCount: shares.length,
    viewsCount: views,
    tags,
  };
};

router.param('id', async (req, res, next, id) => {
  try {
    const gif = await Gif.findOne({
      shortId: id,
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
    const query = {};
    if (req.query.before) {
      query.created = { $lt: req.query.before };
    }

    const gifsPromise = Gif.find(query);

    if (req.query.search) {
      gifsPromise.or([
        {
          description: {
            $regex: req.query.search,
            $options: 'i',
          },
        },
        {
          tags: {
            $regex: req.query.search,
            $options: 'i',
          },
        },
      ]);
    }

    const gifs = await gifsPromise.limit(PAGE_SIZE).sort({ created: -1 });

    return res.send(await Promise.all(gifs.map(serializeGif)));
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

    return res.json(await serializeGif(gif));
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
