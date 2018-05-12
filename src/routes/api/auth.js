const express = require('express');
const { sign } = require('jsonwebtoken');

const config = require('../../config.json');
const { Unauthorized } = require('../../error/httpStatusCodeErrors');
const { User } = require('../../models');

const router = new express.Router();

/**
 * Generates a new jwt
 * @param {User} user
 * @return {Promise}
 */
const generateToken = user => new Promise((res, rej) => {
  sign(
    {
      // eslint-disable-next-line no-underscore-dangle
      userId: user._id,
      username: user.username,
      role: user.role,
    },
    config.authentication.jwtSecret,
    {
      expiresIn: config.authentication.jwtExpiration,
    },
    (err, token) => {
      if (err) {
        return rej();
      }

      return res(token);
    }
  );
});

/**
 * Route: /api/auth/token
 * Method: POST
 *
 * Authenticates an user and returns a jwt if successful
 */
router.post('/token', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.errorHandler(new Unauthorized());
    }

    const match = user.comparePassword(req.body.password);
    if (!match) {
      return res.errorHandler(new Unauthorized());
    }

    return res.send({ token: await generateToken(user) });
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
