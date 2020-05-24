import { Document, Schema, Types } from 'mongoose';

export interface WithOwner<T> extends Document {
  user: T | Types.ObjectId;
}

export interface OwnerMiddlewareOptions {
  field?: string;
  required?: boolean;
  ref?: string;
  index?: boolean;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {string} ref
 * @param {boolean} index
 */
export default (
  schema: Schema,
  { field = 'user', required = true, ref = 'User', index = true }: OwnerMiddlewareOptions = {},
): void => {
  schema.add({
    [field]: {
      type: Types.ObjectId,
      required,
      ref,
      index,
    },
  });
};
