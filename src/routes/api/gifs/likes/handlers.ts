import { Types } from 'mongoose';

import { ClientErrorBadRequest } from '../../../../error/httpException';
import { handler } from '../../../../helpers/express';
import { RequestWithJwtToken } from '../../../../middleware/express/jwtAuth';
import { Like } from '../../../../models/gif';
import { User } from '../../../../models/user';
import { RequestWithGif } from '../../../common/handlers/gifs';

export const addLike = handler(async (req, res, next) => {
  const gif = ((req as unknown) as RequestWithGif).gif;
  const userId = ((req as unknown) as RequestWithJwtToken).authUser.id;

  // Check if the gif is already liked by current user
  const like = gif.likes.find((l: Like) => (l.user as User)._id.equals(userId));

  if (like) {
    return next(new ClientErrorBadRequest());
  }

  const position = gif.likes.push({
    user: new Types.ObjectId(userId),
  });
  gif.likesCount = position;

  await gif.save();
  await gif.populate(`likes.${position - 1}.user`, 'username').execPopulate();

  res.send(gif.likes[position - 1]);
});

export const removeLike = handler(async (req, res, next) => {
  const gif = ((req as unknown) as RequestWithGif).gif;
  const userId = ((req as unknown) as RequestWithJwtToken).authUser.id;

  // Check if the gif is already liked by current user
  const like = gif.likes.find((l: Like) => (l.user as User)._id.equals(userId));

  if (!like) {
    return next(new ClientErrorBadRequest());
  }

  gif.likes.id(like._id).remove();
  gif.likesCount = gif.likes.length;

  await gif.save();

  res.send();
});
