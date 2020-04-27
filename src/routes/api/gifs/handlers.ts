import { Request } from 'express';
import { Types } from 'mongoose';
import { basename, extname, join } from 'path';
import { v4 } from 'uuid';

import config from '../../../../config.json';
import {
  ClientErrorBadRequest,
  ServerErrorInternalServerError,
} from '../../../error/httpException';
import { handler } from '../../../helpers/express';
import { IRequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import { Rating } from '../../../models/common/constants';
import Gif from '../../../models/gif';
import GifFile from '../../../models/gifFile';
import User from '../../../models/user';
import { downloadFile } from '../../../utils/download';
import { getFileSize, move, remove } from '../../../utils/files';
import { getImagePredominantHexColor, getSize, saveFrameFromGif } from '../../../utils/images';

interface IGifQuery {
  _id?: {
    $lt: string;
  };
  $text?: {
    $search: string;
  };
  rating?: Rating;
}

const queryFromReq = (req: Request) => {
  const query: IGifQuery = {};

  if (req.query.before) {
    query._id = { $lt: req.query.before };
  }
  if (req.query.matching) {
    query.$text = { $search: req.query.matching };
  }
  if (req.query.rating) {
    query.rating = req.query.rating;
  }
  return query;
};

const addGifFileByUrl = async (url: string) => {
  const tempPath = join(config.dirs.uploadDir, `${v4()}.gif`);
  const md5checksum = await downloadFile(url, tempPath);
  let gifFile = await GifFile.findOne({ md5checksum });

  if (!gifFile) {
    const { width, height } = await getSize(tempPath);
    const fileSize = await getFileSize(tempPath);
    const framePath = join(config.dirs.uploadDir, `${basename(tempPath, extname(tempPath))}.jpg`);

    await saveFrameFromGif(tempPath, framePath);
    const frameFileSize = await getFileSize(framePath);

    gifFile = await GifFile.create({
      md5checksum,
      width,
      height,
      color: await getImagePredominantHexColor(framePath),
      fileSize,
      frameFileSize,
      importationUrls: [
        {
          url,
        },
      ],
    });

    await Promise.all([
      move(tempPath, join(config.dirs.gifsDir, `${gifFile._id}.gif`)),
      move(framePath, join(config.dirs.gifsDir, `${gifFile._id}.jpg`)),
    ]);
  } else if (!gifFile.importationUrls.some((i) => i.url === url)) {
    gifFile.importationUrls.push({
      url,
    });

    await Promise.all([remove(tempPath), gifFile.save()]);
  }

  return gifFile;
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

export const addGif = handler(async (req, res) => {
  let gifFile;
  if (req.body.url) {
    gifFile = await addGifFileByUrl(req.body.url);
  } else if (true) {
    gifFile = await addGifFileByUrl(req.body.url);
  } else {
    throw new ClientErrorBadRequest();
  }

  if (!gifFile) {
    throw new ServerErrorInternalServerError();
  }

  const userId = ((req as unknown) as IRequestWithJwtToken).user.id;

  const gif = await Gif.create({
    gifFile,
    color: gifFile.color,
    user: await User.findById(userId),
    height: gifFile.height,
    width: gifFile.width,
  });

  return res.send(await gif);
});
