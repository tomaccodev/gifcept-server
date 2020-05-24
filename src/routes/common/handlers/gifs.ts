import { Request } from 'express';

import { ClientErrorNotFound } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';
import GifModel, { Gif } from '../../../models/gif';

export interface RequestWithGif extends Request {
  gif: Gif;
}

export const gifByShortId = paramHandler(async (req, _, next, id) => {
  const gif = await GifModel.findOne({
    shortId: id,
  });

  if (!gif) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as RequestWithGif).gif = gif;
  next();
});

export const gifById = paramHandler(async (req, _, next, id) => {
  const gif = await GifModel.findOne({
    _id: id,
  });

  if (!gif) {
    return next(new ClientErrorNotFound());
  }

  ((req as unknown) as RequestWithGif).gif = gif;
  next();
});
