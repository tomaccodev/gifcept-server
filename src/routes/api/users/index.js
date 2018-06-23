const fs = require('fs');
const path = require('path');
const express = require('express');

const { User } = require('../../../models');
const { NotFound } = require('../../../error/httpStatusCodeErrors');

const router = new express.Router();

router.param('id', async (req, res, next, id) => {
  try {
    const user = await User.findOne({
      _id: id,
    });

    if (!user) {
      return res.errorHandler(new NotFound());
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.errorHandler(err);
  }
});

// Loop over files in this folder
fs.readdirSync(__dirname).forEach(file => {
  const fileName = path.basename(file, path.extname(file));
  const filePath = path.join(__dirname, file);

  // Skip index.js
  if (__filename === filePath) {
    return;
  }

  // Register route with the same name as the file
  // eslint-disable-next-line import/no-dynamic-require, global-require
  router.use(`/:id/${fileName}`, require(`./${fileName}`));
});

module.exports = router;
