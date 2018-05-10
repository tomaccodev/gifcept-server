const { isDevelopment } = require('../../helpers/env');

/**
 * Error handler
 * @param {Error} err
 * @param {Response} res
 */
const handleError = (err, res) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);

  if (isDevelopment()) {
    res.send({
      message: err.message,
      stack: err.stack,
    });
  }
  res.end();
};

module.exports = {
  /**
   * Express middleware that adds a custom error handler to response
   * @param {Request} req
   * @param {Response} res
   * @param {function} next
   */
  responseErrorHandler: (req, res, next) => {
    res.errorHandler = (err) => {
      handleError(err, res);
    };

    next();
  },

  /**
   * Express error middleware
   * @param {Error} err
   * @param {Request} req
   * @param {Response} res
   * @param {function} next
   */
  // eslint-disable-next-line no-unused-vars
  errorHandler: (err, req, res, next) => {
    handleError(err, res);
  },
};
