const bcrypt = require('bcrypt');

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {int} saltingRounds
 * @param {string} comparisonFunction
 * @param {RegExp} match
 * @param {string} doesNotMatchMessage
 */
module.exports = (
  schema,
  {
    field = 'password',
    required = true,
    saltingRounds = 10,
    comparisonFunction = 'comparePassword',
    // eslint-disable-next-line no-useless-escape
    match = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\$%\^\&*\)\(\]\[\+=\.,_-]).{8,}$/,
    doesNotMatchMessage = `${field} must be at least 8 chars, contain 1 number, lower and upper case and special char`,
  } = {},
) => {
  const fieldDescription = {
    [field]: {
      type: String,
      required,
      match: [match, doesNotMatchMessage],
    },
  };

  schema.add(fieldDescription);

  schema.pre('save', async function schemaWithPasswordPreSave(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }

    try {
      // generate a hash and override the clear text password with the hashed one
      this.password = await bcrypt.hash(this.password, saltingRounds);
      return next();
    } catch (err) {
      return next(err);
    }
  });

  // eslint-disable-next-line no-param-reassign
  schema.methods[comparisonFunction] = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password).catch(() => false);
  };
};
