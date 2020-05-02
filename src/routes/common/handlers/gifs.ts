import { Request } from 'express';

import { ClientErrorNotFound } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';
import Gif, { IGif } from '../../../models/gif';

export interface IRequestWithGif extends Request {
  gif: IGif;
}

export const gifByShortId = paramHandler(async (req, res, next, id) => {
  const gif = await Gif.findOne({
    shortId: id,
  });

  if (!gif) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as IRequestWithGif).gif = gif;
  return next();
});

export const gifById = paramHandler(async (req, res, next, id) => {
  const gif = await Gif.findOne({
    _id: id,
  });

  if (!gif) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as IRequestWithGif).gif = gif;
  return next();
});
