const { Router } = require('express');

const { NotFound } = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const filesToRoutes = require('@danilupion/server-utils/routes/filesToRoutes');

const { User } = require('../../../models');

const router = new Router();

router.param('id', async (req, res, next, id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.errorHandler(new NotFound());
    }

    req.query.user = user;
    return next();
  } catch (err) {
    return res.errorHandler(err);
  }
});

filesToRoutes(__dirname, {
  router,
  basePath: '/:id/',
});

module.exports = router;
