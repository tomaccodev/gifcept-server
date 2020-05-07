import { Request } from 'express';
import { Document, DocumentQuery } from 'mongoose';
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
import Gif, { IGif } from '../../../models/gif';
import GifFile, { IGifFile } from '../../../models/gifFile';
import User from '../../../models/user';
import { downloadFile } from '../../../utils/download';
import { getFileSize, md5hash, move, remove } from '../../../utils/files';
import { getImagePredominantHexColor, getSize, saveFrameFromGif } from '../../../utils/images';
import { IRequestWithGif } from '../../common/handlers/gifs';

interface IGifSimpleQuery {
  _id?: {
    $lt: string;
  };
  description?: {
    $regex: RegExp;
    $options: string;
  };
  tags?: {
    $regex: RegExp;
    $options: string;
  };
  rating?: Rating;
}

const queryFromReq = (req: Request) => {
  const query: IGifSimpleQuery = {};

  if (req.query.before) {
    query._id = { $lt: req.query.before };
  }
  if (req.query.rating) {
    query.rating = req.query.rating;
  }
  if (req.query.matching) {
    const regExpCondition = { $regex: new RegExp(req.query.matching), $options: 'i' };
    return {
      $or: [
        { ...query, description: regExpCondition },
        { ...query, tags: regExpCondition },
      ],
    };
  } else {
    return query;
  }
};

const normalize = (toNormalize: DocumentQuery<IGif[] | IGif, any> | IGif) =>
  toNormalize
    .populate('user', 'username')
    .populate('likes.user', 'username')
    .populate('comments.user', 'username')
    .populate('shares.user', 'username');

export const getGifs = handler(async (req, res, next) => {
  const gifs = await normalize(
    Gif.find(queryFromReq(req), null, {
      sort: {
        created: -1,
      },
    }).limit(config.pageSizes.gifs),
  );

  return res.send(gifs);
});

const findOrCreateGifFile = async (tempPath: string, md5checksum: string, url?: string) => {
  let gifFile = await GifFile.findOne({ md5checksum });

  if (!gifFile) {
    const { width, height } = await getSize(tempPath);
    const fileSize = await getFileSize(tempPath);
    const framePath = join(config.dirs.uploadDir, `${basename(tempPath, extname(tempPath))}.jpg`);

    await saveFrameFromGif(tempPath, framePath);
    const frameFileSize = await getFileSize(framePath);

    const importationUrls = [];
    if (url) {
      importationUrls.push({ url });
    }
    gifFile = await GifFile.create({
      md5checksum,
      width,
      height,
      color: await getImagePredominantHexColor(framePath),
      fileSize,
      frameFileSize,
      importationUrls,
    });

    await Promise.all([
      move(tempPath, join(config.dirs.gifsDir, `${gifFile._id}.gif`)),
      move(framePath, join(config.dirs.gifsDir, `${gifFile._id}.jpg`)),
    ]);
  } else if (url && !gifFile.importationUrls.some((i) => i.url === url)) {
    gifFile.importationUrls.push({
      url,
    });

    await Promise.all([remove(tempPath), gifFile.save()]);
  }

  return gifFile;
};

const findOrCreateGifFileByUrl = async (url: string) => {
  const tempPath = join(config.dirs.uploadDir, `${v4()}.gif`);
  const md5checksum = await downloadFile(url, tempPath);

  return await findOrCreateGifFile(tempPath, md5checksum, url);
};

const findOrCreateGifFileByUpload = async (file: Express.Multer.File) => {
  const tempPath = file.path;
  const md5checksum = await md5hash(tempPath);

  return await findOrCreateGifFile(tempPath, md5checksum);
};

const addGif = async (gifFile: IGifFile, userId: string) => {
  return await Gif.create({
    gifFile,
    color: gifFile.color,
    user: await User.findById(userId),
    height: gifFile.height,
    width: gifFile.width,
  });
};

export const addGifByUrl = handler(async (req, res, next) => {
  const gifFile = await findOrCreateGifFileByUrl(req.body.url);

  if (!gifFile) {
    return next(new ServerErrorInternalServerError());
  }

  return res.send(await addGif(gifFile, ((req as unknown) as IRequestWithJwtToken).user.id));
});

export const addGifByUpload = handler(async (req, res, next) => {
  if (req.file.mimetype !== 'image/gif') {
    return next(new ClientErrorBadRequest());
  }
  const gifFile = await findOrCreateGifFileByUpload(req.file);

  if (!gifFile) {
    return next(new ServerErrorInternalServerError());
  }

  return res.send(await addGif(gifFile, ((req as unknown) as IRequestWithJwtToken).user.id));
});

export const updateGif = handler(async (req, res, next) => {
  const gif = (req as IRequestWithGif).gif;

  if (req.body.description) {
    gif.description = req.body.description;
  }
  if (req.body.rating) {
    gif.rating = req.body.rating;
  }
  if (req.body.tags) {
    gif.tags = req.body.tags;
  }

  await gif.save();
  await normalize(gif);

  return res.send(gif);
});

export const deleteGif = handler(async (req, res, next) => {
  const gif = (req as IRequestWithGif).gif;

  await gif.remove();

  return res.send();
});
