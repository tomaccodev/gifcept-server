const { Schema } = require('mongoose');

const timestampsPlugin = require('./timestamps');
const ownerPlugin = require('./owner');

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} multiple
 * @param {*} defaultValue
 * @param {boolean} author
 * @param {object} authorOptions
 * @param {boolean} timestamps
 * @param {object} timestampsOptions
 */
module.exports = (
  schema,
  {
    field = 'comments',
    required = false,
    multiple = true,
    defaultValue = multiple ? [] : null,
    author = true,
    authorOptions = { field: 'user' },
    timestamps = true,
    timestampsOptions = {},
  } = {},
) => {
  const commentSchema = new Schema({
    text: {
      type: String,
      required: true,
    },
  });

  if (author) {
    commentSchema.plugin(ownerPlugin, authorOptions);
  }
  if (timestamps) {
    commentSchema.plugin(timestampsPlugin, timestampsOptions);
  }

  schema.add({
    [field]: {
      type: multiple ? [commentSchema] : commentSchema,
      required,
      default: defaultValue,
    },
  });
};
