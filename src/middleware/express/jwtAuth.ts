import { Request } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '../../../config.json';
import { ClientErrorUnauthorized } from '../../error/httpException';

export interface IRequestWithJwtToken extends Request {
  authUser: {
    id: string;
  };
}

const params = {
  secretOrKey: config.authentication.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

/**
 * JWT strategy that will extend response with a new user property containing the id
 */
const strategy = new Strategy(params, (payload, done) => {
  if (payload.id) {
    return done(null, {
      id: payload.id,
    });
  }

  return done(new ClientErrorUnauthorized());
});

passport.use(strategy);

export default passport.authenticate('jwt', { session: false, assignProperty: 'authUser' });
