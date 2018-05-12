const fs = require('fs');
const path = require('path');

// Return an object with all the models, keys will be filenames with first letter made uppercase
module.exports = fs.readdirSync(__dirname).reduce(
  (accumulated, file) => {
    const fileName = path.basename(file, path.extname(file));
    const className = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    const filePath = path.resolve(__dirname, file);

    if (__filename === filePath) {
      return { ...accumulated };
    }

    return {
      ...accumulated,
      // eslint-disable-next-line import/no-dynamic-require, global-require
      [className]: require(filePath),
    };
  },
  {}
);
