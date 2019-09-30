const { Router } = require('express');

const {
  NotFound,
  InternalServerError,
} = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const filesToRoutes = require('@danilupion/server-utils/routes/filesToRoutes');

const router = new Router();

const { gifQueryFromRequest } = require('../../../utils/search');
const { Gif } = require('../../../models');

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
    const gifs = await Gif.normalizedQuery(gifQueryFromRequest(req));

    return res.send(await Promise.all(gifs.map(g => g.serialize())));
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

filesToRoutes(__dirname, {
  router,
  basePath: '/:id/',
});

// Return 404 for the rest of the routes
router.use('*', (req, res) => {
  res.status(404).end();
});

module.exports = router;
