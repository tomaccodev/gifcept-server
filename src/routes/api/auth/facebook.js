const { Router } = require('express');

const {
  Unauthorized,
  InternalServerError,
} = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const {
  middleware: facebookAuthMiddleware,
} = require('@danilupion/server-utils/middlewares/express/facebook-auth');

const { generateToken } = require('../../../utils/tokens');
const roles = require('../../../constants/userRoles');
const { User } = require('../../../models');

const router = new Router();

router.post('/', facebookAuthMiddleware, async (req, res) => {
  try {
    if (req.user) {
      const { id, displayName, emails } = req.user;
      let user = await User.findOne({ 'facebook.id': id });

      if (!user) {
        user = new User({
          username: displayName,
          email: emails[0].value,
          role: roles.user,
          facebook: {
            id,
            email: emails[0].value,
            username: displayName,
          },
        });

        await user.save();
      }

      return res.send({ token: await generateToken(user) });
    }
    return res.errorHandler(new Unauthorized());
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
