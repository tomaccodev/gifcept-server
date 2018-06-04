const express = require('express');
const fs = require('fs');
const path = require('path');

const router = new express.Router();

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
  router.use(`/${fileName}`, require(`./${fileName}`));
});

module.exports = router;
