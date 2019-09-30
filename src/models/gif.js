const mongoose = require('mongoose');

const shortId = require('@danilupion/server-utils/middlewares/mongoose/shortId');
const owner = require('@danilupion/server-utils/middlewares/mongoose/owner');
const timestamps = require('@danilupion/server-utils/middlewares/mongoose/timestamps');
const comments = require('@danilupion/server-utils/middlewares/mongoose/comments');
const normalizeJSON = require('@danilupion/server-utils/middlewares/mongoose/normalizeJSON');

const gifRatings = require('../constants/ratings');
const config = require('../config');
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
      default: gifRatings.sfw,
      enum: Object.keys(gifRatings).map(roleKey => gifRatings[roleKey]),
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
  .plugin(normalizeJSON);

GifSchema.methods.serialize = async function serialize() {
  await this.populate('user').execPopulate();

  const {
    id,
    // eslint-disable-next-line no-shadow
    shortId,
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
    shortId,
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
  before,
  user,
  search,
  ratings = [gifRatings.sfw],
  order = gifOrder.creation,
  limit = config.pageSizes.gifs,
}) {
  const query = {};
  if (before) {
    // eslint-disable-next-line no-underscore-dangle
    query._id = { $lt: before };
  }

  if (user) {
    query.user = user;
  }

  if (ratings) {
    query.rating = { $in: ratings };
  }

  const gifsPromise = this.find(query);

  if (search) {
    gifsPromise.or([
      {
        description: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        tags: {
          $regex: search,
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
