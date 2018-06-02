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
    const { gifFile } = await Gif.findOne({ shortId: req.params.id }).populate('gifFile');
    if (!gifFile) {
      return res.errorHandler(new NotFound());
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.sendFile(path.join(config.gifsDir, `${gifFile._id}${path.extname(req.path)}`));
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
