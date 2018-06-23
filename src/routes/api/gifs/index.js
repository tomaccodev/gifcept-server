const express = require('express');
const fs = require('fs');
const path = require('path');

const { gifQueryMetadataFromRequest } = require('../../../utils/search');
const { NotFound, InternalServerError } = require('../../../error/httpStatusCodeErrors');
const { Gif } = require('../../../models');

const router = new express.Router();

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
    const gifs = await Gif.normalizedQuery(gifQueryMetadataFromRequest(req));

    return res.send(await Promise.all(gifs.map(g => g.serialize())));
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
