import { Document, model, Schema } from 'mongoose';

import email, { IWithEmail } from '../middleware/mongoose/email';
import password, { IWithPassword } from '../middleware/mongoose/password';
import timestamps, { IWithCreated, IWithUpdated } from '../middleware/mongoose/timestamps';

export enum Role {
  user = 'user',
  admin = 'admin',
}

export interface IUser extends Document, IWithEmail, IWithPassword, IWithCreated, IWithUpdated {
  username: string;
  role: Role;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema(
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
      enum: Object.values(Role),
      default: Role.user,
    },
  },
  { collection: 'users' },
)
  .plugin(email)
  .plugin(password, { required: false })
  .plugin(timestamps);

UserSchema.set('toJSON', {
  virtuals: true,
});

export default model<IUser>('User', UserSchema);
