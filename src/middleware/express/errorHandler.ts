import { Request, Response } from 'express';

import config from '../../../config.json';
import { HttpException } from '../../error/httpException';

export default (error: HttpException, _: Request, res: Response): void => {
  const status = error.statusCode;
  const message = error.message;

  if (config.environment === 'development') {
    console.log(error);
    if (error.optionalParams && error.optionalParams.debug) {
      console.log('Error debug information:', error.optionalParams.debug);
    }
  }

  res.status(status).send(message);
};
