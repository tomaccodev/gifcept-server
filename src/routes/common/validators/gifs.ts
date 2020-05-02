import { NextFunction, Request, Response } from 'express';

import { ClientErrorUnauthorized } from '../../../error/httpException';
import { IRequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import { IRequestWithGif } from '../handlers/gifs';

export const ownedByUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as IRequestWithJwtToken).user.id;
  const gif = (req as IRequestWithGif).gif;

  if (userId !== gif.user.toString()) {
    return next(new ClientErrorUnauthorized());
  }
  return next();
};
