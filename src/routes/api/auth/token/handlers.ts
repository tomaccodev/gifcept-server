import { RequestHandler } from 'express';

import { ClientErrorUnauthorized } from '../../../../error/httpException';
import { handler } from '../../../../helpers/express';
import User from '../../../../models/user';
import { generateToken } from '../../../../utils/tokens';

export const createToken: RequestHandler = handler(async (req, res, next) => {
  const user = await User.findOne({
    $or: [{ email: req.body.usernameOrEmail }, { username: req.body.usernameOrEmail }],
  });

  if (!user) {
    return next(new ClientErrorUnauthorized());
  }

  const match = await user.comparePassword(req.body.password);
  if (!match) {
    return next(new ClientErrorUnauthorized());
  }

  return res.send({ token: await generateToken(user) });
});
