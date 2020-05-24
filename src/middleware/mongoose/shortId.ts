import { Document, Schema } from 'mongoose';
import { generate } from 'shortid';

export interface WithShortId extends Document {
  shortId: string;
}

interface ShortIdMiddleware {
  field?: string;
  required?: boolean;
  index?: boolean;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} index
 */
export default (
  schema: Schema,
  { field = 'shortId', required = true, index = true }: ShortIdMiddleware = {},
): void => {
  schema.add({
    [field]: {
      type: String,
      default: generate,
      required,
      index,
    },
  });
};
