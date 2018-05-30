const mongoose = require('mongoose');

const ratings = require('../constants/ratings');
const timestamps = require('../plugins/mongoose/timestamps');

const ImportationUrlSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
).plugin(timestamps, { update: false });

const GifFileSchema = new mongoose.Schema(
  {
    md5checksum: {
      type: String,
      required: true,
      index: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    frameSize: {
      type: Number,
      required: true,
    },
    importationUrls: {
      type: [ImportationUrlSchema],
      default: [],
    },
    rating: {
      type: String,
      required: true,
      enum: Object.keys(ratings).map(roleKey => ratings[roleKey]),
      index: true,
    },
    moderated: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'gifFiles' },
).plugin(timestamps);

module.exports = mongoose.model('GifFile', GifFileSchema);
