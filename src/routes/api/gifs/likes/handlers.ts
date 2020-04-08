import { Types } from 'mongoose';

import { ClientErrorBadRequest } from '../../../../error/httpException';
import { handler } from '../../../../helpers/express';
import { IRequestWithJwtToken } from '../../../../middleware/express/jwtAuth';
import { IUser } from '../../../../models/user';
import { IRequestWithGif } from '../../../common/handlers/gifs';

export const addLike = handler(async (req, res, next) => {
  const gif = ((req as unknown) as IRequestWithGif).gif;
  const userId = ((req as unknown) as IRequestWithJwtToken).user.id;

  // Check if the gif is already liked by current user
  const like = gif.likes.find((l) => (l.user as IUser)._id.equals(userId));

  if (like) {
    return next(new ClientErrorBadRequest());
  }

  gif.likes.push({
    user: new Types.ObjectId(userId),
  });
  gif.likesCount = gif.likes.length;

  await gif.save();

  return res.send();
});

export const removeLike = handler(async (req, res, next) => {
  const gif = ((req as unknown) as IRequestWithGif).gif;
  const userId = ((req as unknown) as IRequestWithJwtToken).user.id;

  // Check if the gif is already liked by current user
  const like = gif.likes.find((l) => (l.user as IUser)._id.equals(userId));

  if (!like) {
    return next(new ClientErrorBadRequest());
  }

  gif.likes.id(like._id).remove();
  gif.likesCount = gif.likes.length;

  await gif.save();

  return res.send();
});
