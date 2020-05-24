import { join } from 'path';

import { Mongoose } from 'mongoose';
import mysql, { Connection, FieldPacket, RowDataPacket } from 'mysql2/promise';
import { v4 } from 'uuid';

import config from '../../config.json';
import connectMongoose from '../helpers/mongoose';
import { Rating } from '../models/common/constants';
import GifModel, { Gif } from '../models/gif';
import GifFileModel, { GifFile } from '../models/gifFile';
import UserModel, { Role, User } from '../models/user';
import { copy } from '../utils/files';
import { getImagePredominantHexColor, saveFrameFromGif } from '../utils/images';

interface MysqlModel {
  id: number;
}

interface MysqlWithTimestamps {
  created_at: string;
  updated_at: string;
}

interface MysqlUser extends MysqlModel, MysqlWithTimestamps {
  id: number;
  username: string;
  email: string;
  role: Role;
}

interface MysqlGifImportationUrl {
  url: string;
  created_at: string;
}

interface MysqlGifLike {
  user_id: number;
  created_at: string;
}

interface MysqlGifComment {
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface MysqlGifTag {
  name: string;
}

interface MysqlGifFile extends MysqlModel, MysqlWithTimestamps {
  sguid: string;
  md5checksum: string;
  width: number;
  height: number;
  animation_size: number;
  static_size: number;
}

interface MysqlGif extends MysqlModel, MysqlWithTimestamps {
  gif_id: number;
  user_id: number;
  sguid: string;
  description: string;
  user_rating: Rating;
  views: number;
}

const users: { [key: number]: User } = {};
const gifFiles: { [key: number]: GifFile } = {};
const gifs: { [key: number]: Gif } = {};

let mysqlConnection: Connection;
let mongooseConnection: Mongoose;

const query = (
  queryString: string,
): Promise<[RowDataPacket[][] | RowDataPacket[], FieldPacket[]]> =>
  mysqlConnection.query(queryString);

const connectMysql = (): Promise<Connection> =>
  mysql.createConnection({
    ...config.mysql,
  });

const removeData = (): Promise<unknown> =>
  Promise.all([
    UserModel.remove({}).exec(),
    GifFileModel.remove({}).exec(),
    GifModel.remove({}).exec(),
  ]);

const importUser = async (mysqlUser: MysqlUser): Promise<void> => {
  users[mysqlUser.id] = await UserModel.create({
    username: mysqlUser.username,
    email: mysqlUser.email,
    role: mysqlUser.role,
    password: `${v4()}aA1_`,
    created: new Date(`${mysqlUser.created_at}Z`),
    updated:
      mysqlUser.created_at !== mysqlUser.updated_at
        ? new Date(`${mysqlUser.updated_at}Z`)
        : undefined,
  });
};

const importGifFile = async (mysqlGif: MysqlGifFile): Promise<void> => {
  const [urls] = await query(`
    SELECT gif_importation_urls.url, gif_importation_urls.created_at
    FROM gif_importation_urls
    WHERE gif_importation_urls.gif_id=${mysqlGif.id}
  `);

  const gifPath = join(config.dirs.importSource, `${mysqlGif.sguid}.gif`);

  const framePath = join(config.dirs.importSource, `${mysqlGif.sguid}.jpg`);

  try {
    await saveFrameFromGif(gifPath, framePath);

    const defaultColor = '#000000';
    let color = defaultColor;

    try {
      color = await getImagePredominantHexColor(framePath);
    } catch (e) {
      console.log(`Could not find color for gif ${gifPath}`);
    }

    if (!color) {
      color = defaultColor;
      console.log(`Color was falsy for gif ${gifPath}`);
    }

    const createdGif = await GifFileModel.create({
      md5checksum: mysqlGif.md5checksum,
      width: mysqlGif.width,
      height: mysqlGif.height,
      color,
      fileSize: mysqlGif.animation_size,
      frameFileSize: mysqlGif.static_size,
      importationUrls: (urls as MysqlGifImportationUrl[]).map((u) => ({
        url: u.url,
        created: `${u.created_at}Z`,
      })),
    });

    gifFiles[mysqlGif.id] = createdGif;

    await Promise.all([
      copy(gifPath, join(config.dirs.gifsDir, `${createdGif._id}.gif`)),
      copy(framePath, join(config.dirs.gifsDir, `${createdGif._id}.jpg`)),
    ]);
  } catch (e) {
    console.error('Error', e);
  }
};

const importGif = async (mysqlGif: MysqlGif): Promise<void> => {
  if (!gifFiles[mysqlGif.gif_id]) {
    return;
  }

  const likesPromise = query(`
    SELECT user_gif_likes.*
    FROM user_gif_likes
    WHERE unliked IS NULL
      AND user_gif_likes.user_gif_id=${mysqlGif.id}
  `);

  const commentsPromise = query(`
    SELECT user_gif_comments.*
    FROM user_gif_comments
    WHERE user_gif_comments.user_gif_id=${mysqlGif.id}
  `);

  const tagsPromise = query(`
    SELECT user_tags.name
    FROM user_tags, user_gif_tags
    WHERE user_gif_tags.user_tag_id = user_tags.id
      AND user_gif_tags.user_gif_id=${mysqlGif.id}
  `);

  const [[likes], [comments], [tags]] = await Promise.all([
    likesPromise,
    commentsPromise,
    tagsPromise,
  ]);

  await GifModel.create({
    gifFile: gifFiles[mysqlGif.gif_id],
    user: users[mysqlGif.user_id],
    shortId: mysqlGif.sguid,
    description: mysqlGif.description,
    width: gifFiles[mysqlGif.gif_id].width,
    height: gifFiles[mysqlGif.gif_id].height,
    color: gifFiles[mysqlGif.gif_id].color,
    rating: mysqlGif.user_rating,
    views: mysqlGif.views,
    created: `${mysqlGif.created_at}Z`,
    updated: mysqlGif.created_at !== mysqlGif.updated_at ? `${mysqlGif.updated_at}Z` : null,
    likes: (likes as MysqlGifLike[]).map((l) => ({
      user: users[l.user_id],
      created: `${l.created_at}Z`,
    })),
    likesCount: (likes as MysqlGifLike[]).length,
    comments: (comments as MysqlGifComment[]).map((c) => ({
      user: users[c.user_id],
      text: c.comment,
      created: `${c.created_at}Z`,
      updated: c.created_at !== c.updated_at ? `${c.updated_at}Z` : null,
    })),
    commentsCount: (comments as MysqlGifComment[]).length,
    tags: (tags as MysqlGifTag[]).map((t) => t.name),
  }).then((createdGif) => {
    gifs[mysqlGif.id] = createdGif;
  });
};

const importUsers = async (): Promise<void> => {
  const [mysqlUsers] = await query(`
    SELECT users.*, IF(ISNULL(roles.name), 'user', roles.name) as role
      FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON roles.id = user_roles.role_id
  `);

  let usersCount = 0;

  await Promise.all(
    (mysqlUsers as MysqlUser[]).map((mysqlUser) =>
      importUser(mysqlUser).then(() => {
        usersCount += 1;
        console.log(`Created user ${usersCount}/${(mysqlUsers as MysqlUser[]).length}`);
      }),
    ),
  );
};

const importGifFiles = async (): Promise<void> => {
  const [mysqlGifFiles] = await query(`
    SELECT gifs.*
      FROM gifs
  `);

  let gifFilesCount = 0;

  await Promise.all(
    (mysqlGifFiles as MysqlGifFile[]).map((gif) =>
      importGifFile(gif).then(() => {
        gifFilesCount += 1;
        console.log(`Created gifFile ${gifFilesCount}/${(mysqlGifFiles as MysqlGifFile[]).length}`);
      }),
    ),
  );
};

const importGifs = async (): Promise<void> => {
  const [mysqlGifs] = await query(`
    SELECT user_gifs.*
      FROM user_gifs
  `);

  let gifsCount = 0;

  await Promise.all(
    (mysqlGifs as MysqlGif[]).map((gif) =>
      importGif(gif).then(() => {
        gifsCount += 1;
        console.log(`Created gif ${gifsCount}/${(mysqlGifs as MysqlGif[]).length}`);
      }),
    ),
  );
};

const importData = async (): Promise<void> => {
  [mysqlConnection, mongooseConnection] = await Promise.all([connectMysql(), connectMongoose()]);
  await removeData();
  await Promise.all([importUsers(), importGifFiles()]);
  await importGifs();

  await mongooseConnection.disconnect();
  mysqlConnection.destroy();
};

importData();
