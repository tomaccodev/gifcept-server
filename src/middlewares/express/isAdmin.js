const { User } = require('../../models/index');
const { Unauthorized } = require('../../error/httpStatusCodeErrors');
const jwtAuth = require('./jwt-auth');
const user = require('./user');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === User.ROLES.admin) {
    return next();
  }

  return res.send(new Unauthorized());
};

module.exports = {
  isAdmin,
  isAdminMiddlewaresArray: [jwtAuth, user, isAdmin],
};
