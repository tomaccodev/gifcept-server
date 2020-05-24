import { Document, Schema, Types, model } from 'mongoose';

import comments, { WithComments } from '../middleware/mongoose/comments';
import normalizeJSON from '../middleware/mongoose/normalizeJSON';
import owner, { WithOwner } from '../middleware/mongoose/owner';
import shortId from '../middleware/mongoose/shortId';
import timestamps, { WithCreated, WithUpdated } from '../middleware/mongoose/timestamps';

import { Rating } from './common/constants';
import { GifFile } from './gifFile';
import { User } from './user';

export interface Like extends WithCreated, WithOwner<User> {}

const LikeSchema = new Schema({})
  .plugin(owner)
  .plugin(timestamps, { update: false })
  .plugin(normalizeJSON, {
    remove: ['_id', 'user._id', 'user.created'],
    virtuals: true,
  });

export interface Share extends WithCreated, WithOwner<User> {
  gif: Gif;
}

const ShareSchema = new Schema({
  gif: {
    type: Types.ObjectId,
    ref: 'Gif',
    required: true,
    index: true,
  },
})
  .plugin(owner)
  .plugin(timestamps, { update: false });

ShareSchema.set('toJSON', {
  virtuals: true,
});

export interface Gif
  extends Document,
    WithOwner<User>,
    WithComments<User>,
    WithCreated,
    WithUpdated {
  gifFile: GifFile;
  width: number;
  height: number;
  color: string;
  description: string;
  rating: Rating;
  viewsCount: number;
  tags: string[];
  likes: Types.DocumentArray<Like>;
  likesCount: number;
  shares: Types.DocumentArray<Share>;
  sharesCount: number;
  commentsCount: number;
}

const GifSchema = new Schema(
  {
    gifFile: {
      type: Types.ObjectId,
      ref: 'GifFile',
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      validate: [(v): boolean => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
    },
    description: {
      type: String,
      index: 'text',
      default: null,
    },
    rating: {
      type: String,
      required: true,
      default: Rating.sfw,
      enum: Object.values(Rating),
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    tags: {
      type: [String],
      index: 'text',
      default: [],
    },
    likes: {
      type: [LikeSchema],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    shares: {
      type: [ShareSchema],
      default: [],
    },
    sharesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { collection: 'gifs' },
)
  .plugin(shortId)
  .plugin(owner)
  .plugin(timestamps, { indexCreation: true })
  .plugin(comments)
  .plugin(normalizeJSON, {
    remove: [
      '_id',
      '__v',
      'gifFile',
      'user._id',
      'comments.*._id',
      'comments.*.user._id',
      'comments.*.user.created',
    ],
    virtuals: true,
  });

export default model<Gif>('Gif', GifSchema);
