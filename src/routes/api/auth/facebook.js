const express = require('express');

const { generateToken } = require('../../../utils/tokens');
const roles = require('../../../constants/userRoles');
const { Unauthorized, InternalServerError } = require('../../../error/httpStatusCodeErrors');
const { User } = require('../../../models');
const facebookAuthMiddleware = require('../../../middlewares/express/facebook-auth');

const router = new express.Router();

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
