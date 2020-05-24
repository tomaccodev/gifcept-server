import { sign } from 'jsonwebtoken';

import config from '../../config.json';
import { User } from '../models/user';

export const generateToken = (user: User): Promise<string> =>
  new Promise((res, rej) => {
    sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      config.authentication.jwtSecret,
      {
        expiresIn: config.authentication.jwtExpiration,
      },
      (err, encoded) => {
        if (err) {
          return rej(err);
        }
        return res(encoded);
      },
    );
  });
