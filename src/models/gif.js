const mongoose = require('mongoose');

const ratings = require('../constants/ratings');
const shortId = require('../middlewares/mongoose/shortId');
const owner = require('../middlewares/mongoose/owner');
const timestamps = require('../middlewares/mongoose/timestamps');
const comments = require('../middlewares/mongoose/comments');
const normalizeJSON = require('../middlewares/mongoose/normalizeJSON');

const LikeSchema = new mongoose.Schema({}).plugin(owner).plugin(timestamps, { update: false });

const ShareSchema = new mongoose.Schema({
  gif: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gif',
    required: true,
    index: true,
  },
})
  .plugin(owner)
  .plugin(timestamps, { update: false });

const GifSchema = new mongoose.Schema(
  {
    gifFile: {
      type: mongoose.Schema.Types.ObjectId,
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
      validate: [v => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
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
      type: [String],
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
  .plugin(shortId)
  .plugin(owner)
  .plugin(timestamps, { indexCreation: true })
  .plugin(comments)
  .plugin(normalizeJSON, { rename: { shortId: 'id' } });

module.exports = mongoose.model('Gif', GifSchema);
