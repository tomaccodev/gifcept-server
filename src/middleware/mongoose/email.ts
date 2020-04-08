import { Document, Schema, SchemaDefinition } from 'mongoose';

export interface IWithEmail extends Document {
  email: string;
}

interface IEmailMiddlewareOptions {
  field?: string;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  match?: RegExp;
  doesNotMatchMessage?: string;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} unique
 * @param {boolean} index
 * @param {RegExp} match
 * @param {string} doesNotMatchMessage
 */
export default (
  schema: Schema,
  {
    field = 'email',
    required = true,
    unique = true,
    index = true,
    match = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
    doesNotMatchMessage = `Value for '${field}' is not a valid email`,
  }: IEmailMiddlewareOptions = {},
) => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: String,
      required,
      unique,
      index,
      match: [match, doesNotMatchMessage],
    },
  };

  schema.add(fieldDescription);
};
