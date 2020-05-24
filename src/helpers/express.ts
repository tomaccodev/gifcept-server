import { NextFunction, Request, RequestHandler, RequestParamHandler, Response } from 'express';
import { validationResult } from 'express-validator';

import { ClientErrorBadRequest, ServerErrorInternalServerError } from '../error/httpException';

type InsecureHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

type InsecureParamHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string,
  name: string,
) => void | Promise<void>;

// TODO: Generalize handlers they have a lot of common code
export const handler: (insecureHandler: InsecureHandler) => RequestHandler = (
  insecureHandler,
) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new ClientErrorBadRequest({
          debug: errors.mapped(),
        }),
      );
    }

    return await insecureHandler(req, res, next);
  } catch (err) {
    return next(new ServerErrorInternalServerError(err));
  }
};

export const paramHandler: (insecureHandler: InsecureParamHandler) => RequestParamHandler = (
  insecureHandler,
) => async (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string,
  name: string,
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new ClientErrorBadRequest({
          debug: errors.mapped(),
        }),
      );
    }

    return await insecureHandler(req, res, next, value, name);
  } catch (err) {
    return next(new ServerErrorInternalServerError(err));
  }
};
