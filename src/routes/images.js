const path = require('path');
const { Router } = require('express');

const { NotFound } = require('@danilupion/server-utils/error/httpStatusCodeErrors');

const { Gif } = require('../models');
const config = require('../config');

const router = new Router();

/**
 * Route: /:id.gif & /:id.jpg
 * Method: GET
 *
 * Retrieves an image
 */
router.get('/:id.(gif|jpg)', async (req, res) => {
  try {
    const gif = await Gif.findOne({ shortId: req.params.id }).populate('gifFile');
    if (!gif) {
      return res.errorHandler(new NotFound());
    }

    const extension = path.extname(req.path);

    if (extension === '.gif') {
      gif.viewsCount += 1;
      await gif.save();
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.sendFile(path.join(config.dirs.gifsDir, `${gif.gifFile._id}${extension}`));
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
