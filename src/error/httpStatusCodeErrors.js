const ERROR_CODES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

/**
 * Error class factory function
 * @param {number} statusCode
 * @param {string} message
 * @return {class}
 */
const statusCodeFactory = (statusCode, message) =>
  class StatusCodeError extends Error {
    constructor(originalError) {
      super(message);
      this.statusCode = statusCode;
      this.originalError = originalError;
    }
  };

// Module exports will look like { BadRequest: <class>, ...}
module.exports = Object.keys(ERROR_CODES).reduce(
  (accumulated, code) => ({
    ...accumulated,
    [ERROR_CODES[code].replace(/ /g, '')]: statusCodeFactory(code, ERROR_CODES[code]),
  }),
  {},
);
