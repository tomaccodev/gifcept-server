import { handler } from '../../../helpers/express';
import { RequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import GifModel from '../../../models/gif';

export const getUserTags = handler(async (req, res) => {
  const userGifs = await GifModel.find({
    user: (req as RequestWithJwtToken).authUser.id,
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
