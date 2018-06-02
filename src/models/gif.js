const mongoose = require('mongoose');

const ratings = require('../constants/ratings');
const shortid = require('../middlewares/mongoose/shortid');
const owner = require('../middlewares/mongoose/owner');
const timestamps = require('../middlewares/mongoose/timestamps');
const comments = require('../middlewares/mongoose/comments');
const normalizeJSON = require('../middlewares/mongoose/normalizeJSON');

const TagSchema = new mongoose.Schema(
  {
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  { _id: false },
).plugin(timestamps, { update: false });

const LikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { _id: false },
).plugin(timestamps, { update: false });

const ShareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gif: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gif',
      required: true,
      index: true,
    },
  },
  { _id: false },
).plugin(timestamps, { update: false });

const GifSchema = new mongoose.Schema(
  {
    gifFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GifFile',
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    rating: {
      type: String,
      required: true,
      default: ratings.sfw,
      enum: Object.keys(ratings).map(roleKey => ratings[roleKey]),
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [TagSchema],
      default: [],
    },
    likes: {
      type: [LikeSchema],
      default: [],
    },
    shares: {
      type: [ShareSchema],
      default: [],
    },
  },
  { collection: 'gifs' },
)
  .plugin(shortid)
  .plugin(owner)
  .plugin(timestamps, { indexCreation: true })
  .plugin(comments)
  .plugin(normalizeJSON, { rename: { shortId: 'id' } });

module.exports = mongoose.model('Gif', GifSchema);
