const mongoose = require('mongoose');

const timestamps = require('../plugins/mongoose/timestamps');

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  { collection: 'tags' },
).plugin(timestamps);

module.exports = mongoose.model('Tag', TagSchema);
