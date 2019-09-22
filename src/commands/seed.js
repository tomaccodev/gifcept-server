/* eslint-disable no-console */
const mongoose = require('mongoose');

const connectMongoose = require('@danilupion/server-utils/helpers/mongoose');

const roles = require('../constants/userRoles');
const { User } = require('../models');
const config = require('../config');

const USERS = [
  {
    username: 'admin',
    email: 'admin@gifcept.com',
    password: 'admin',
    role: roles.admin,
  },
  {
    username: 'user',
    email: 'user@gifcept.com',
    password: 'user',
    role: roles.user,
  },
];

const createIfNotPresent = async (
  Model,
  data,
  { saveData = data, validateBeforeSave = true } = {},
) => {
  const existingModel = await Model.findOne(data);

  if (!existingModel) {
    await new Model(saveData).save({ validateBeforeSave });
  }

  return !existingModel;
};

const createUsersAsync = async () => {
  await Promise.all(
    USERS.map(async user => {
      const { password, ...dataWithoutPassword } = user;

      const created = await createIfNotPresent(User, dataWithoutPassword, {
        saveData: user,
        validateBeforeSave: false,
      });

      console.log(`User ${user.username} was ${created ? 'created' : 'skipped'}`);
    }),
  );
};

const seedDatabaseAsync = async () => {
  try {
    await connectMongoose(mongoose.connect, config.mongodb);

    await Promise.all([createUsersAsync()]);
  } catch (err) {
    console.log(err.message);
  } finally {
    process.exit();
  }
};

seedDatabaseAsync();
