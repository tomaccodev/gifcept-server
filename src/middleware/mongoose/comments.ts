import { Document, DocumentToObjectOptions, Schema, Types } from 'mongoose';

import ownerPlugin, { OwnerMiddlewareOptions } from './owner';
import timestampsPlugin, {
  TimestampsMiddlewareOptions,
  WithCreated,
  WithUpdated,
} from './timestamps';

interface Comment<T> extends WithCreated, WithUpdated {
  user: T | Types.ObjectId;
  text: string;
}

export interface WithComments<T> extends Document {
  comments: Types.DocumentArray<Comment<T>>;
}

interface CommentsMiddlewareOptions {
  field?: string;
  required?: boolean;
  multiple?: boolean;
  author?: boolean;
  authorOptions?: OwnerMiddlewareOptions;
  timestamps?: boolean;
  timestampsOptions?: TimestampsMiddlewareOptions;
  toJsonOptions?: DocumentToObjectOptions;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {string} field
 * @param {boolean} required
 * @param {boolean} multiple
 * @param {boolean} author
 * @param {object} authorOptions
 * @param {boolean} timestamps
 * @param {object} timestampsOptions
 * @param toJsonOptions
 */
export default (
  schema: Schema,
  {
    field = 'comments',
    required = false,
    multiple = true,
    author = true,
    authorOptions = { field: 'user' },
    timestamps = true,
    timestampsOptions = {},
    toJsonOptions = { virtuals: true },
  }: CommentsMiddlewareOptions = {},
): void => {
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

  commentSchema.set('toJSON', toJsonOptions);

  schema.add({
    [field]: {
      type: multiple ? [commentSchema] : commentSchema,
      required,
      default: multiple ? [] : undefined,
    },
  });
};
