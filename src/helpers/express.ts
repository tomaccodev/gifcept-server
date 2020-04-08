import { RequestHandler, RequestParamHandler } from 'express';
import { validationResult } from 'express-validator';

import { ClientErrorBadRequest, ServerErrorInternalServerError } from '../error/httpException';

// TODO: Generalize handlers they have a lot of common code
export const handler: (
  insecureHandler: RequestHandler,
) => RequestHandler = insecureHandler => async (req, res, next) => {
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

export const paramHandler: (
  insecureHandler: RequestParamHandler,
) => RequestParamHandler = insecureHandler => async (req, res, next, value, name) => {
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
