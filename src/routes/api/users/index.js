const { Router } = require('express');

const { NotFound } = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const filesToRoutes = require('@danilupion/server-utils/routes/filesToRoutes');

const { User } = require('../../../models');

const router = new Router();

router.param('id', async (req, res, next, id) => {
  try {
    console.log(id);
    const user = await User.findById(id);

    if (!user) {
      return res.errorHandler(new NotFound());
    }

    req.user = user;
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
