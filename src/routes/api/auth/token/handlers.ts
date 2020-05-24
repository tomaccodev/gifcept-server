import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ClientErrorUnauthorized } from '../../../../error/httpException';
import { handler } from '../../../../helpers/express';
import UserModel from '../../../../models/user';
import { generateToken } from '../../../../utils/tokens';

export const createToken: RequestHandler = handler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({
      $or: [{ email: req.body.usernameOrEmail }, { username: req.body.usernameOrEmail }],
    });

    if (!user) {
      return next(new ClientErrorUnauthorized());
    }

    const match = await user.comparePassword(req.body.password);
    if (!match) {
      return next(new ClientErrorUnauthorized());
    }

    res.send({ token: await generateToken(user) });
  },
);
