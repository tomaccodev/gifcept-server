/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {*} defaultValue
 */
module.exports = (schema, { field = 'tags', required = false, defaultValue = [] } = {}) => {
  schema.add({
    [field]: {
      type: [String],
      required,
      default: defaultValue,
    },
  });
};
