const mongoose = require('mongoose');

const connectMongoose = require('@danilupion/server-utils/helpers/mongoose');

const { User } = require('../models');
const config = require('../config');

const doConnect = async () => {
  await connectMongoose(mongoose.connect, config.mongodb);
};

require('yargs') // eslint-disable-line
  .command(
    'change-password [username] [password]',
    'Changes a users password',
    yargs => {
      yargs
        .positional('username', {
          describe: 'The username to change',
        })
        .positional('password', {
          describe: 'the new password',
        });
    },
    async argv => {
      try {
        await doConnect();

        const user = await User.findOne({ username: argv.username });

        if (!user) {
          console.error(`Could not find user ${argv.username}`);
        } else {
          user.password = argv.password;
          await user.save();
          console.log(`Password changed to ${argv.username}`);
        }
      } catch (e) {
        console.log(`Error while change password to ${argv.username}`, e.message);
      }
      process.exit();
    },
  ).argv;
