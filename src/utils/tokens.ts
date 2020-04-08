import { sign } from 'jsonwebtoken';

import config from '../../config.json';
import { IUser } from '../models/user';

export const generateToken = (user: IUser) =>
  new Promise((res, rej) => {
    sign(
      {
        id: user._id,
        email: user.email,
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
