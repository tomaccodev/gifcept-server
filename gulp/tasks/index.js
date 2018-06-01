const fs = require('fs');
const path = require('path');

module.exports = config =>
  fs.readdirSync(__dirname).reduce((accumulated, file) => {
    const tasks = { ...accumulated };

    const taskname = path.basename(file, path.extname(file));
    const filePath = path.resolve(__dirname, file);
    if (__filename !== filePath) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      tasks[taskname] = require(`./${taskname}`)(config[taskname]);
    }

    return tasks;
  }, {});
