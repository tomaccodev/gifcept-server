/* tslint:disable:no-console */
import yargs from 'yargs';

import connectMongoose from '../helpers/mongoose';
import User, { Role } from '../models/user';

// tslint:disable-next-line:no-unused-expression
export default yargs
  .command(
    'create <email> <password>',
    'Create user command',
    commandYarg => {
      commandYarg
        .positional('email', {
          describe: 'Email to be used',
          type: 'string',
        })
        .positional('password', {
          describe: 'Password to be used',
          type: 'string',
        })
        .alias('a', 'admin')
        .describe('a', 'Should the user be admin?')
        .boolean('a');
    },
    async argv => {
      const { username, email, password, admin } = argv;

      try {
        await connectMongoose();
        await User.create({
          username,
          email,
          password,
          role: admin ? Role.admin : Role.user,
        });
        console.log('User created');
      } catch (e) {
        console.log(`Error while creating user ${e.message}`);
      }
      process.exit();
    },
  )
  .command(
    'updatePassword <email> <password>',
    `Update an user's password command`,
    commandYarg => {
      commandYarg
        .positional('email', {
          describe: 'Email to be used',
          type: 'string',
        })
        .positional('password', {
          describe: 'Password to be used',
          type: 'string',
        });
    },
    async (argv: { email: string; password: string }) => {
      const { email, password } = argv;

      try {
        await connectMongoose();
        const user = await User.findOne({
          email,
        });

        if (!user) {
          console.log(`Could not find user with email ${email}`);
        } else {
          user.password = password;
          await user.save();
          console.log('Password updated');
        }
      } catch (e) {
        console.log(`Error while updating user's password ${e.message}`);
      }

      process.exit();
    },
  )
  .demandCommand().argv;
