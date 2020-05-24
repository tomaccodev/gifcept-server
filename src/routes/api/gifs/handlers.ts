import { basename, extname, join } from 'path';

import { Request } from 'express';
import { Document, DocumentQuery, Types } from 'mongoose';
import { v4 } from 'uuid';

import config from '../../../../config.json';
import {
  ClientErrorBadRequest,
  ServerErrorInternalServerError,
} from '../../../error/httpException';
import { handler } from '../../../helpers/express';
import { RequestWithJwtToken } from '../../../middleware/express/jwtAuth';
import { Rating } from '../../../models/common/constants';
import GifModel, { Gif } from '../../../models/gif';
import GifFileModel, { GifFile } from '../../../models/gifFile';
import UserModel from '../../../models/user';
import { downloadFile } from '../../../utils/download';
import { getFileSize, md5hash, move, remove } from '../../../utils/files';
import { getImagePredominantHexColor, getSize, saveFrameFromGif } from '../../../utils/images';
import { RequestWithGif } from '../../common/handlers/gifs';
import { RequestWithUser } from '../../common/handlers/users';
import { RequestWithTag } from '../tags/handlers';

interface GifSimpleQuery {
  _id?: {
    $lt: string;
  };
  user?: Types.ObjectId;
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

type GifQuery =
  | GifSimpleQuery
  | { $or: GifSimpleQuery[] }
  | { $and: (GifSimpleQuery | { $or: GifSimpleQuery[] })[] };

const queryFromReq = (req: Request): GifQuery => {
  const query: GifSimpleQuery = {};

  if ((req as RequestWithUser).user) {
    query.user = (req as RequestWithUser).user._id;
  }
  if (req.query.before) {
    query._id = { $lt: req.query.before };
  }
  if (req.query.rating) {
    query.rating = req.query.rating;
  }
  if ((req as RequestWithTag).tag) {
    query.tags = {
      $regex: new RegExp(`^${(req as RequestWithTag).tag}$`),
      $options: 'i',
    };
  }
  if (req.query.matching) {
    const regExpCondition = { $regex: new RegExp(req.query.matching), $options: 'i' };
    return query.tags
      ? {
          $and: [
            { ...query },
            {
              $or: [{ description: regExpCondition }, { tags: regExpCondition }],
            },
          ],
        }
      : {
          $or: [
            { ...query, description: regExpCondition },
            { ...query, tags: regExpCondition },
          ],
        };
  } else {
    return query;
  }
};

interface MightHaveExecPopulate {
  execPopulate?: () => Promise<Gif>;
}

const normalize = (
  toNormalize: DocumentQuery<Gif[] | Gif, Document> | Gif,
): Promise<Gif> | Gif | DocumentQuery<Gif[] | Gif, Document> => {
  const normalizedValue = toNormalize
    .populate('user', 'username')
    .populate('likes.user', 'username')
    .populate('comments.user', 'username')
    .populate('shares.user', 'username');

  return (normalizedValue as MightHaveExecPopulate).execPopulate
    ? (normalizedValue as Gif).execPopulate()
    : normalizedValue;
};

export const getGifs = handler(async (req, res) => {
  const gifs = await normalize(
    GifModel.find(queryFromReq(req), null, {
      sort: {
        created: -1,
      },
    }).limit(config.pageSizes.gifs),
  );

  res.send(gifs);
});

const findOrCreateGifFile = async (
  tempPath: string,
  md5checksum: string,
  url?: string,
): Promise<GifFile> => {
  let gifFile = await GifFileModel.findOne({ md5checksum });

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
    gifFile = await GifFileModel.create({
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

const findOrCreateGifFileByUrl = async (url: string): Promise<GifFile> => {
  const tempPath = join(config.dirs.uploadDir, `${v4()}.gif`);
  const md5checksum = await downloadFile(url, tempPath);

  return await findOrCreateGifFile(tempPath, md5checksum, url);
};

const findOrCreateGifFileByUpload = async (file: Express.Multer.File): Promise<GifFile> => {
  const tempPath = file.path;
  const md5checksum = await md5hash(tempPath);

  return await findOrCreateGifFile(tempPath, md5checksum);
};

const addGif = async (gifFile: GifFile, userId: string): Promise<Gif> => {
  return await GifModel.create({
    gifFile,
    color: gifFile.color,
    user: await UserModel.findById(userId),
    height: gifFile.height,
    width: gifFile.width,
  });
};

export const addGifByUrl = handler(async (req, res, next) => {
  const gifFile = await findOrCreateGifFileByUrl(req.body.url);

  if (!gifFile) {
    return next(new ServerErrorInternalServerError());
  }

  res.send(
    await normalize(await addGif(gifFile, ((req as unknown) as RequestWithJwtToken).authUser.id)),
  );
});

export const addGifByUpload = handler(async (req, res, next) => {
  if (req.file.mimetype !== 'image/gif') {
    return next(new ClientErrorBadRequest());
  }
  const gifFile = await findOrCreateGifFileByUpload(req.file);

  if (!gifFile) {
    return next(new ServerErrorInternalServerError());
  }

  res.send(
    await normalize(await addGif(gifFile, ((req as unknown) as RequestWithJwtToken).authUser.id)),
  );
});

export const updateGif = handler(async (req, res) => {
  const gif = (req as RequestWithGif).gif;

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

  res.send(gif);
});

export const deleteGif = handler(async (req, res) => {
  const gif = (req as RequestWithGif).gif;

  await gif.remove();

  res.send();
});
