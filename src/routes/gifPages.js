const { Router } = require('express');

const { NotFound } = require('@danilupion/server-utils/error/httpStatusCodeErrors');

const { Gif } = require('../models');
const config = require('../config');

const router = new Router();

/**
 * Route: /:id
 * Method: GET
 *
 * Retrieves a gif page
 */
router.get('/:id([\\d\\w]{7,12})', async (req, res) => {
  try {
    const gif = await Gif.findOne({ shortId: req.params.id }).populate('gifFile');
    if (!gif) {
      return res.errorHandler(new NotFound());
    }

    return res.render('gif', {
      baseUrl: config.baseUrl,
      facebookId: config.facebook.clientId,
      gif,
    });
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
