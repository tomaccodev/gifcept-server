const { promisify } = require('util');
const { sign } = require('jsonwebtoken');

const config = require('../config.json');

module.exports = {
  generateToken: user =>
    promisify(sign)(
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
    ),
};
