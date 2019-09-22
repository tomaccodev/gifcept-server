const { Unauthorized } = require('@danilupion/server-utils/error/httpStatusCodeErrors');

const { User } = require('../../models');

/**
 * Middleware that replaces user from jwt with user from database
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @return {Promise}
 */
module.exports = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      req.user = await User.findOne({ _id: req.user.id });
      return next();
    } catch (err) {
      return res.errorHandler(err);
    }
  }

  throw new Unauthorized();
};
