import { Types } from 'mongoose';

import { ClientErrorNotFound, ClientErrorUnauthorized } from '../../../../error/httpException';
import { handler } from '../../../../helpers/express';
import { IRequestWithJwtToken } from '../../../../middleware/express/jwtAuth';
import { IRequestWithGif } from '../../../common/handlers/gifs';

export const getGifComments = handler(async (req, res, next) => {
  const gif = ((req as unknown) as IRequestWithGif).gif;

  await gif.populate('comments.author').execPopulate();

  return res.send(gif.comments);
});

export const addComment = handler(async (req, res, next) => {
  const gif = ((req as unknown) as IRequestWithGif).gif;
  const userId = ((req as unknown) as IRequestWithJwtToken).user.id;

  gif.comments.push({
    text: req.body.comment.trim(),
    user: Types.ObjectId(userId),
  });

  gif.commentsCount = gif.comments.length;
  await gif.save();

  const commentIndex = gif.comments.length - 1;
  await gif.populate(`comments.${commentIndex}.user`).execPopulate();

  const comment = gif.comments[commentIndex];

  return res.send(comment);

  return res.send();
});

export const removeComment = handler(async (req, res, next) => {
  const gif = ((req as unknown) as IRequestWithGif).gif;
  const userId = ((req as unknown) as IRequestWithJwtToken).user.id;

  const comment = gif.comments.id(req.params.id);

  if (!comment) {
    return next(new ClientErrorNotFound());
  }

  if (!(comment.user as Types.ObjectId).equals(userId)) {
    return next(new ClientErrorUnauthorized());
  }

  comment.remove();
  gif.commentsCount = gif.comments.length;
  await gif.save();

  return res.send();
});
