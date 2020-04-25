import { Request } from 'express';

import config from '../../../../config.json';
import { handler } from '../../../helpers/express';
import Gif from '../../../models/gif';

interface IGifQuery {
  _id?: {
    $lt: string;
  };
  $text?: {
    $search: string;
  };
}

const queryFromReq = (req: Request) => {
  const query: IGifQuery = {};

  if (req.query.before) {
    query._id = { $lt: req.query.before };
  }
  if (req.query.matching) {
    query.$text = { $search: req.query.matching };
  }
  return query;
};

export const getGifs = handler(async (req, res, next) => {
  const gifs = await Gif.find(queryFromReq(req), null, {
    sort: {
      created: -1,
    },
  })
    .limit(config.pageSizes.gifs)
    .populate('user');

  return res.send(gifs);
});
