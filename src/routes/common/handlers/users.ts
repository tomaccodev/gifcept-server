import { Request } from 'express';

import { ClientErrorNotFound } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';
import User, { IUser } from '../../../models/user';

export interface IRequestWithUser extends Request {
  user: IUser;
}

export const userById = paramHandler(async (req, res, next, id) => {
  const user = await User.findOne({
    _id: id,
  });

  if (!user) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as IRequestWithUser).user = user;
  return next();
});
