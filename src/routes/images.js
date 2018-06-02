const path = require('path');
const express = require('express');

const { NotFound } = require('../error/httpStatusCodeErrors');
const { Gif } = require('../models');
const config = require('../config');

const router = new express.Router();

/**
 * Route: /:id.gif & /:id.png
 * Method: GET
 *
 * Retrieves an image
 */
router.get('/:id.(gif|png)', async (req, res) => {
  try {
    const gif = await Gif.findOne({ shortId: req.params.id }).populate('gifFile');
    if (!gif) {
      return res.errorHandler(new NotFound());
    }

    const extension = path.extname(req.path);

    if (extension === '.gif') {
      gif.views += 1;
      await gif.save();
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.sendFile(path.join(config.gifsDir, `${gif.gifFile._id}${extension}`));
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
