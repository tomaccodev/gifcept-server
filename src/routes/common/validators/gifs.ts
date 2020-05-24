import { NextFunction, Request, Response } from 'express';

import { ClientErrorUnauthorized } from '../../../error/httpException';
import { RequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import { RequestWithGif } from '../handlers/gifs';

export const ownedByUser = (req: Request, _: Response, next: NextFunction): void => {
  const userId = (req as RequestWithJwtToken).authUser.id;
  const gif = (req as RequestWithGif).gif;

  if (userId !== gif.user.toString()) {
    return next(new ClientErrorUnauthorized());
  }
  next();
};
