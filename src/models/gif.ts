import { Document, model, Schema, Types } from 'mongoose';

import comments, { IWithComments } from '../middleware/mongoose/comments';
import normalizeJSON from '../middleware/mongoose/normalizeJSON';
import owner, { IWithOwner } from '../middleware/mongoose/owner';
import shortId from '../middleware/mongoose/shortId';
import timestamps, { IWithCreated, IWithUpdated } from '../middleware/mongoose/timestamps';

import { Rating } from './common/constants';
import { IGifFile } from './gifFile';
import { IUser } from './user';

export interface ILike extends IWithCreated, IWithOwner<IUser> {}

const LikeSchema = new Schema({}).plugin(owner).plugin(timestamps, { update: false });

export interface IShare extends IWithCreated, IWithOwner<IUser> {
  gif: IGif;
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

export interface IGif
  extends Document,
    IWithOwner<IUser>,
    IWithComments<IUser>,
    IWithCreated,
    IWithUpdated {
  gifFile: IGifFile;
  width: number;
  height: number;
  color: string;
  description: string;
  rating: Rating;
  viewsCount: number;
  tags: string[];
  likes: Types.DocumentArray<ILike>;
  likesCount: number;
  shares: Types.DocumentArray<IShare>;
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
      validate: [(v) => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
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
      index: "text",
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
    rename: {
      _id: 'id',
      'user.username': 'userName',
      'user._id': 'userId',
    },
    remove: ['__v', 'gifFile', 'user'],
  });

export default model<IGif>('Gif', GifSchema);
