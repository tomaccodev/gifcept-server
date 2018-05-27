const { default: mockingoose } = require('mockingoose');
const User = require('../../src/models/user');

const roles = require('../../src/constants/userRoles');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the doc with findById', async () => {
    const mockedDoc = {
      email: 'name@email.com',
      role: roles.user,
    };

    mockingoose.User.toReturn(mockedDoc, 'findOne');

    const user = await User.findOne({ _id: '507f191e810c19729de860ea' });
    expect(user.toJSON()).toMatchObject(mockedDoc);
  });

  it('should return the doc with update', async () => {
    const mockedDoc = {
      id: '507f191e810c19729de860ea',
      email: 'name@email.com',
      role: roles.user,
    };

    mockingoose.User.toReturn(mockedDoc, 'update');

    const user = await User.update({ email: 'changed' }).where({ _id: '507f191e810c19729de860ea' });

    expect(JSON.parse(JSON.stringify(user))).toMatchObject(mockedDoc);
  });
});
