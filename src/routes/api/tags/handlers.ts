import { Request } from 'express';

import { ClientErrorBadRequest } from '../../../error/httpException';
import { paramHandler } from '../../../helpers/express';

export interface RequestWithTag extends Request {
  tag: string;
}

export const byTag = paramHandler(async (req, _, next, tag) => {
  if (!tag) {
    return next(new ClientErrorBadRequest());
  }

  ((req as unknown) as RequestWithTag).tag = tag;
  next();
});
