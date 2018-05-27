/**
 * @param {Mongoose.Schema} schema
 * @param {object} rename
 * @param string[] remove
 */
module.exports = (
  schema,
  {
    rename = {
      _id: 'id',
    },
    remove = ['__v'],
  } = {},
) => {
  schema.set('toJSON', {
    transform: (doc, json) => {
      /* eslint-disable no-param-reassign, no-restricted-syntax */
      for (const [from, to] of Object.entries(rename)) {
        if (typeof json[from] !== 'undefined') {
          json[to] = json[from];
          delete json[from];
        }
      }

      for (const prop of remove) {
        if (typeof json[prop] !== 'undefined') {
          delete json[prop];
        }
      }

      return json;
      /* eslint-enable no-param-reassign, no-restricted-syntax */
    },
  });
};
