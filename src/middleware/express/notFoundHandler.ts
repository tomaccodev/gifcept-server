import { NextFunction, Request, Response } from 'express';

import { ClientErrorNotFound } from '../../error/httpException';

export default (request: Request, response: Response, next: NextFunction) => {
  throw new ClientErrorNotFound();
};
