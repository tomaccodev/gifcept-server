import { NextFunction, Request, Response } from 'express';

import config from '../../../config.json';
import { HttpException } from '../../error/httpException';

export default (error: HttpException, request: Request, response: Response, next: NextFunction) => {
  const status = error.statusCode;
  const message = error.message;

  if (config.environment === 'development') {
    // tslint:disable-next-line:no-console
    console.log(error);
    if (error.optionalParams && error.optionalParams.debug) {
      // tslint:disable-next-line:no-console
      console.log('Error debug information:', error.optionalParams.debug);
    }
  }

  response.status(status).send(message);
};
