import { handler } from '../../../helpers/express';
import { IRequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import Gif from '../../../models/gif';

export const getUserTags = handler(async (req, res, next) => {
  const userGifs = await Gif.find({
    user: (req as IRequestWithJwtToken).user.id,
  });

  const tags: string[] = [];
  for (const gif of userGifs) {
    for (const tag of gif.tags) {
      const lowerCaseTag = tag.toLowerCase();
      if (tags.find((s) => s.toLowerCase() === lowerCaseTag) === undefined) {
        tags.push(tag);
      }
    }
  }

  res.send(tags.sort());
});
