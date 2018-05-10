const fs = require('fs');
const path = require('path');

const express = require('express');

const router = new express.Router();

// Loop over files in this folder
fs.readdirSync(__dirname).forEach((file) => {
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

// Return 404 for the rest of the routes
router.use('*', (req, res) => {
  res.status(404).end();
});

module.exports = router;
