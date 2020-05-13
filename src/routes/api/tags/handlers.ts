import { Request } from 'express';

import { ClientErrorBadRequest } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';

export interface IRequestWithTag extends Request {
  tag: string;
}

export const byTag = paramHandler(async (req, res, next, tag) => {
  if (!tag) {
    return next(new ClientErrorBadRequest());
  }

  ((req as unknown) as IRequestWithTag).tag = tag;
  return next();
});
