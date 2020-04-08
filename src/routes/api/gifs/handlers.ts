import config from '../../../../config.json';
import { handler } from '../../../helpers/express';
import Gif from '../../../models/gif';

export const getGifs = handler(async (req, res, next) => {
  const gifs = await Gif.find({}, null, {
    sort: {
      created: -1,
    },
  })
    .limit(config.pageSizes.gifs)
    .populate('user');

  return res.send(gifs);
});
