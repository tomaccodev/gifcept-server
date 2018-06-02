const { generate } = require('shortid');

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} index
 */
module.exports = (schema, { field = 'shortId', required = true, index = true } = {}) => {
  schema.add({
    [field]: {
      type: String,
      default: generate,
      required,
      index,
    },
  });
};
