const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('../../config');

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, cb) => cb(null, profile),
  ),
);

module.exports = passport.authenticate('facebook-token', { session: false });
