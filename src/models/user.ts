import { Document, Schema, model } from 'mongoose';

import email, { WithEmail } from '../middleware/mongoose/email';
import password, { WithPassword } from '../middleware/mongoose/password';
import timestamps, { WithCreated, WithUpdated } from '../middleware/mongoose/timestamps';

export enum Role {
  user = 'user',
  admin = 'admin',
}

export interface User extends Document, WithEmail, WithPassword, WithCreated, WithUpdated {
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

export default model<User>('User', UserSchema);
