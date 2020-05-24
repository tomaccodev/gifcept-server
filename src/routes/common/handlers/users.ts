import { Request } from 'express';

import { ClientErrorNotFound } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';
import UserModel, { User } from '../../../models/user';

export interface RequestWithUser extends Request {
  user: User;
}

export const userByUsername = paramHandler(async (req, _, next, id) => {
  const user = await UserModel.findOne({
    username: id,
  });

  if (!user) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as RequestWithUser).user = user;
  next();
});
