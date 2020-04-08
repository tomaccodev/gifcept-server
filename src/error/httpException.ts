interface IOptionaExceptionParams {
  debug?: any;
  message?: string;
}

export abstract class HttpException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public optionalParams: IOptionaExceptionParams = {},
  ) {
    super(message);
  }
}

const generateHttpStatusCodeError = (statusCode: number, message: string) =>
  // tslint:disable-next-line:max-classes-per-file
  class StatusCodeError extends HttpException {
    constructor(optionalParams: IOptionaExceptionParams = {}) {
      super(statusCode, optionalParams.message ? optionalParams.message : message, optionalParams);
    }
  };

export const ClientErrorBadRequest = generateHttpStatusCodeError(400, 'Bad Request');
export const ClientErrorUnauthorized = generateHttpStatusCodeError(401, 'Unauthorized');
export const ClientErrorPaymentRequired = generateHttpStatusCodeError(402, 'Payment Required');
export const ClientErrorForbidden = generateHttpStatusCodeError(403, 'Forbidden');
export const ClientErrorNotFound = generateHttpStatusCodeError(404, 'Not Found');
export const ClientErrorMethodNotAllowed = generateHttpStatusCodeError(405, 'Method Not Allowed');

export const ServerErrorInternalServerError = generateHttpStatusCodeError(
  500,
  'Internal Server Error',
);
