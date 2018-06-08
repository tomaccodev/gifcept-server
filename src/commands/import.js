/* eslint-disable function-paren-newline */
const connectMongoose = require('../helpers/mongoose');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4 } = require('uuid');

const { User, GifFile, Gif } = require('../models');
const config = require('../config');
const { copy } = require('../utils/files');
const { getImagePredominantHexColor } = require('../utils/images');
const { saveFrameFromGif } = require('../utils/images');

let mysqlConnection;

const users = {};
const gifFiles = {};
const gifs = {};

const query = queryString => mysqlConnection.query(queryString);

const connectMysql = () =>
  mysql.createConnection({
    ...config.mysql,
  });

const removeData = () =>
  Promise.all([User.remove({}).exec(), GifFile.remove({}).exec(), Gif.remove({}).exec()]);

const importUser = mysqlUser => {
  const payload = {
    username: mysqlUser.username,
    email: mysqlUser.email,
    role: mysqlUser.role,
    created: `${mysqlUser.created_at}Z`,
    updated: mysqlUser.created_at !== mysqlUser.updated_at ? `${mysqlUser.updated_at}Z` : null,
  };

  if (mysqlUser.facebook_id) {
    payload.facebook = {
      id: mysqlUser.facebook_id,
      email: mysqlUser.email,
      username: mysqlUser.username,
    };
  } else {
    payload.password = `${v4()}aA1_`;
  }

  return User.create(payload).then(createdUser => {
    users[mysqlUser.id] = createdUser;
  });
};

const importGifFile = async mysqlGif => {
  const [urls] = await query(`
    SELECT gif_importation_urls.url, gif_importation_urls.created_at
    FROM gif_importation_urls
    WHERE gif_importation_urls.gif_id=${mysqlGif.id}
  `);

  const gifPath = path.join(config.dirs.importSource, `${mysqlGif.sguid}.gif`);

  const framePath = path.join(config.dirs.importSource, `${mysqlGif.sguid}.jpg`);

  try {
    await saveFrameFromGif(gifPath, framePath);

    const defaultColor = '#000000';
    let color = defaultColor;

    try {
      color = await getImagePredominantHexColor(framePath);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Could not find color for gif ${gifPath}`);
    }

    if (!color) {
      color = defaultColor;
      // eslint-disable-next-line no-console
      console.log(`Could was falsy for gif ${gifPath}`);
    }

    const createdGif = await GifFile.create({
      md5checksum: mysqlGif.md5checksum,
      width: mysqlGif.width,
      height: mysqlGif.height,
      color,
      fileSize: mysqlGif.animation_size,
      frameFileSize: mysqlGif.static_size,
      importationUrls: urls.map(u => ({ url: u.url, created: `${u.created_at}Z` })),
    });

    gifFiles[mysqlGif.id] = createdGif;

    await Promise.all([
      // eslint-disable-next-line no-underscore-dangle
      copy(gifPath, path.join(config.dirs.gifsDir, `${createdGif._id}.gif`)),
      // eslint-disable-next-line no-underscore-dangle
      copy(framePath, path.join(config.dirs.gifsDir, `${createdGif._id}.jpg`)),
    ]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error', e);
  }
};

const importGif = async mysqlGif => {
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

  const [[likes], [comments]] = await Promise.all([likesPromise, commentsPromise]);

  await Gif.create({
    gifFile: gifFiles[mysqlGif.gif_id],
    user: users[mysqlGif.user_id],
    shortId: mysqlGif.sguid,
    description: mysqlGif.description,
    color: gifFiles[mysqlGif.gif_id].color,
    rating: mysqlGif.user_rating,
    views: mysqlGif.views,
    created: `${mysqlGif.created_at}Z`,
    updated: mysqlGif.created_at !== mysqlGif.updated_at ? `${mysqlGif.updated_at}Z` : null,
    likes: likes.map(l => ({
      user: users[l.user_id],
      created: `${l.created_at}Z`,
    })),
    comments: comments.map(c => ({
      user: users[c.user_id],
      text: c.comment,
      created: `${c.created_at}Z`,
      updated: c.created_at !== c.updated_at ? `${c.updated_at}Z` : null,
    })),
  }).then(createdGif => {
    gifs[mysqlGif.id] = createdGif;
  });
};

const importUsers = async () => {
  const [mysqlUsers] = await query(`
    SELECT users.*, IF(ISNULL(roles.name), 'user', roles.name) as role
      FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id 
    LEFT JOIN roles ON roles.id = user_roles.role_id
  `);

  let usersCount = 0;

  await Promise.all(
    mysqlUsers.map(mysqlUser =>
      importUser(mysqlUser).then(() => {
        usersCount += 1;
        // eslint-disable-next-line no-console
        console.log(`Created user ${usersCount}/${mysqlUsers.length}`);
      }),
    ),
  );
};

const importGifFiles = async () => {
  const [mysqlGifFiles] = await query(`
    SELECT gifs.*
      FROM gifs
  `);

  let gifFilesCount = 0;

  await Promise.all(
    mysqlGifFiles.map(gif =>
      importGifFile(gif).then(() => {
        gifFilesCount += 1;
        // eslint-disable-next-line no-console
        console.log(`Created gifFile ${gifFilesCount}/${mysqlGifFiles.length}`);
      }),
    ),
  );
};

const importGifs = async () => {
  const [mysqlGifs] = await query(`
    SELECT user_gifs.*
      FROM user_gifs
  `);

  let gifsCount = 0;

  await Promise.all(
    mysqlGifs.map(gif =>
      importGif(gif).then(() => {
        gifsCount += 1;
        // eslint-disable-next-line no-console
        console.log(`Created gif ${gifsCount}/${mysqlGifs.length}`);
      }),
    ),
  );
};

const importData = async () => {
  [mysqlConnection] = await Promise.all([connectMysql(), connectMongoose()]);
  await removeData();
  await Promise.all([importUsers(), importGifFiles()]);
  await importGifs();

  process.exit();
};

importData();
