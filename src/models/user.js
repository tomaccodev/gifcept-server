const mongoose = require('mongoose');

const roles = require('../constants/userRoles');
const normalizeJSON = require('../plugins/mongoose/normalizeJSON');
const email = require('../plugins/mongoose/email');
const password = require('../plugins/mongoose/password');
const timestamps = require('../plugins/mongoose/timestamps');

const UserSchema = new mongoose.Schema({
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
}, { collection: 'users' })
  .plugin(normalizeJSON)
  .plugin(email)
  .plugin(password)
  .plugin(timestamps);

const model = mongoose.model('User', UserSchema);

module.exports = model;
