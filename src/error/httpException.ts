interface OptionaExceptionParams {
  debug?: Record<string, unknown>;
  message?: string;
}

export abstract class HttpException extends Error {
  protected constructor(
    public statusCode: number,
    public message: string,
    public optionalParams: OptionaExceptionParams = {},
  ) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const generateHttpStatusCodeError = (statusCode: number, message: string) =>
  class StatusCodeError extends HttpException {
    constructor(optionalParams: OptionaExceptionParams = {}) {
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
