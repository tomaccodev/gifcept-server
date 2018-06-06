const mongoose = require('mongoose');

const roles = require('../constants/userRoles');
const normalizeJSON = require('../middlewares/mongoose/normalizeJSON');
const email = require('../middlewares/mongoose/email');
const password = require('../middlewares/mongoose/password');
const timestamps = require('../middlewares/mongoose/timestamps');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(roles),
      default: roles.user,
    },
    facebook: {
      // TODO add validator so that if facebook is provided it contains all the fields
      id: {
        type: String,
        index: {
          unique: true,
          partialFilterExpression: { 'facebook.id': { $type: 'string' } },
        },
      },
      email: {
        type: String,
      },
      username: {
        type: String,
      },
    },
  },
  { collection: 'users' },
)
  .plugin(normalizeJSON)
  .plugin(email)
  .plugin(password, { required: false })
  .plugin(timestamps);

module.exports = mongoose.model('User', UserSchema);
