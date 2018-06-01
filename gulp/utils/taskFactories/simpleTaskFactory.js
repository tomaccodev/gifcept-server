const objectValidator = require('../validators/objectValidator');

/**
 * Factory method for simple gulp tasks
 * @param {string} namespace
 * @param {function} task
 * @param {function} configValidator
 */
module.exports = (namespace, task, { configValidator = objectValidator } = {}) => config => {
  if (config) {
    if (!configValidator(config)) {
      // eslint-disable-next-line no-console
      console.error(`[${namespace}] invalid config, please fix and retry.`);
    } else {
      return task(config, namespace);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[${namespace}] missing config, skipped.`);
  }

  return {};
};
