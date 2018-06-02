const mongoose = require('mongoose');

const ratings = require('../constants/ratings');
const timestamps = require('../middlewares/mongoose/timestamps');

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
    color: {
      type: String,
      required: true,
      validate: [v => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    frameFileSize: {
      type: Number,
      required: true,
    },
    importationUrls: {
      type: [ImportationUrlSchema],
      default: [],
    },
    moderatedRating: {
      type: String,
      enum: Object.keys(ratings).map(roleKey => ratings[roleKey]),
    },
  },
  { collection: 'gifFiles' },
).plugin(timestamps);

module.exports = mongoose.model('GifFile', GifFileSchema);
