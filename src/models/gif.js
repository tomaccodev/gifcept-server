const mongoose = require('mongoose');

const ratings = require('../constants/ratings');
const config = require('../config');
const shortId = require('../middlewares/mongoose/shortId');
const owner = require('../middlewares/mongoose/owner');
const timestamps = require('../middlewares/mongoose/timestamps');
const comments = require('../middlewares/mongoose/comments');
const normalizeJSON = require('../middlewares/mongoose/normalizeJSON');
const gifOrder = require('../constants/gifOrder');

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
    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    tags: {
      type: [String],
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
  .plugin(normalizeJSON, { rename: { shortId: 'id' } });

GifSchema.methods.serialize = async function serialize() {
  await this.populate('user').execPopulate();

  const {
    id,
    color,
    description,
    user,
    created,
    commentsCount,
    viewsCount,
    likesCount,
    sharesCount,
    tags,
  } = this.toJSON();

  return {
    id,
    color,
    description,
    user: {
      id: user.id,
      username: user.username,
    },
    created,
    comments: [],
    commentsCount,
    likes: [],
    likesCount,
    shares: [],
    sharesCount,
    viewsCount,
    tags,
  };
};

GifSchema.statics.normalizedQuery = async function normalizedQuery({
  criteria = {},
  order = gifOrder.creation,
  limit = config.pageSizes.gifs,
}) {
  const query = {};
  if (criteria.before) {
    query.created = { $lt: criteria.before };
  }

  if (criteria.user) {
    query.user = criteria.user;
  }

  const gifsPromise = this.find(query);

  if (criteria.search) {
    gifsPromise.or([
      {
        description: {
          $regex: criteria.search,
          $options: 'i',
        },
      },
      {
        tags: {
          $regex: criteria.search,
          $options: 'i',
        },
      },
    ]);
  }

  let sort = { created: -1 };
  if (order === gifOrder.popularity) {
    sort = { likesCount: -1 };
  }

  return gifsPromise.limit(limit).sort(sort);
};

module.exports = mongoose.model('Gif', GifSchema);
