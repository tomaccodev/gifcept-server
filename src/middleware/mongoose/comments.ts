import { Document, DocumentToObjectOptions, Schema, Types } from 'mongoose';

import ownerPlugin, { IOwnerMiddlewareOptions } from './owner';
import timestampsPlugin, {
  ITimestampsMiddlewareOptions,
  IWithCreated,
  IWithUpdated,
} from './timestamps';

interface IComment<T> extends IWithCreated, IWithUpdated {
  user: T | Types.ObjectId;
  text: string;
}

export interface IWithComments<T> extends Document {
  comments: Types.DocumentArray<IComment<T>>;
}

interface ICommentsMiddlewareOptions {
  field?: string;
  required?: boolean;
  multiple?: boolean;
  defaultValue?: any;
  author?: boolean;
  authorOptions?: IOwnerMiddlewareOptions;
  timestamps?: boolean;
  timestampsOptions?: ITimestampsMiddlewareOptions;
  toJsonOptions?: DocumentToObjectOptions;
}

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
 * @param toJsonOptions
 */
export default (
  schema: Schema,
  {
    field = 'comments',
    required = false,
    multiple = true,
    defaultValue = multiple ? [] : null,
    author = true,
    authorOptions = { field: 'user' },
    timestamps = true,
    timestampsOptions = {},
    toJsonOptions = { virtuals: true },
  }: ICommentsMiddlewareOptions = {},
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

  commentSchema.set('toJSON', toJsonOptions);

  schema.add({
    [field]: {
      type: multiple ? [commentSchema] : commentSchema,
      required,
      default: defaultValue,
    },
  });
};
