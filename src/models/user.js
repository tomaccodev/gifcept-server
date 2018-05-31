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
  },
  { collection: 'users' },
)
  .plugin(normalizeJSON)
  .plugin(email)
  .plugin(password)
  .plugin(timestamps);

module.exports = mongoose.model('User', UserSchema);
