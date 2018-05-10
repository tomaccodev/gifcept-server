const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {string} ref
 */
module.exports = (schema, {
  field = 'user',
  required = true,
  ref = 'User',
} = {}) => {
  schema.add({
    [field]: {
      type: ObjectId,
      required,
      ref,
    },
  });
};
