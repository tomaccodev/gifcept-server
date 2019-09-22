const { Router } = require('express');

const {
  Unauthorized,
  BadRequest,
  InternalServerError,
} = require('@danilupion/server-utils/error/httpStatusCodeErrors');

const { generateToken } = require('../../../utils/tokens');
const { User } = require('../../../models');

const router = new Router();

/**
 * Route: /api/auth/token
 * Method: POST
 *
 * Authenticates an user and returns a jwt if successful
 */
router.post('/', async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.errorHandler(new BadRequest());
    }
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.errorHandler(new Unauthorized());
    }

    const match = await user.comparePassword(req.body.password);
    if (!match) {
      return res.errorHandler(new Unauthorized());
    }

    return res.send({ token: await generateToken(user) });
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
