import { extname, join } from 'path';

import config from '../../../config.json';
import { handler } from '../../helpers/express';
import { RequestWithGif } from '../common/handlers/gifs';

export const serveImage = handler(async (req, res) => {
  const gif = ((req as unknown) as RequestWithGif).gif;

  await gif.populate('gifFile');

  const extension = extname(req.path);

  if (extension === '.gif') {
    gif.viewsCount += 1;
    await gif.save();
  }

  return res.sendFile(join(config.dirs.gifsDir, `${gif.gifFile._id}${extension}`));
});
