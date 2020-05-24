import bcrypt from 'bcrypt';
import { Document, Schema, SchemaDefinition } from 'mongoose';

export interface WithPassword extends Document {
  password: string;
}

interface PasswordMiddlewareOptions {
  field?: string;
  required?: boolean;
  saltingRounds?: number;
  comparisonFunction?: string;
  match?: RegExp;
  doesNotMatchMessage?: string;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {int} saltingRounds
 * @param {string} comparisonFunction
 * @param {RegExp} match
 * @param {string} doesNotMatchMessage
 */
export default (
  schema: Schema,
  {
    field = 'password',
    required = true,
    saltingRounds = 10,
    comparisonFunction = 'comparePassword',
    // eslint-disable-next-line no-useless-escape
    match = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\$%\^\&*\)\(\]\[\+=\.,_-]).{8,}$/,
    doesNotMatchMessage = `${field} must be at least 8 chars, contain 1 number, lower and upper case and special char`,
  }: PasswordMiddlewareOptions = {},
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: String,
      required,
      match: [match, doesNotMatchMessage],
    },
  };

  schema.add(fieldDescription);

  schema.pre('save', async function schemaWithPasswordPreSave(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified(field)) {
      return next();
    }

    try {
      // generate a hash and override the clear text password with the hashed one
      this.set(field, await bcrypt.hash(this.get(field), saltingRounds));
      next();
    } catch (err) {
      return next(err);
    }
  });

  schema.methods[comparisonFunction] = function comparePassword(
    candidate: string,
  ): Promise<boolean> {
    return bcrypt.compare(candidate, this.password).catch(() => false);
  };
};
