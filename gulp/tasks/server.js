const path = require('path');
const gulp = require('gulp');
const server = require('gulp-develop-server');

const simpleTaskFactory = require('../utils/taskFactories/simpleTaskFactory');
const objectPropertiesValidatorFactory = require('../utils/validators/objectPropertiesValidatorFactory');
const watchUtil = require('../utils/watch');

module.exports = simpleTaskFactory(
  path.basename(__filename, path.extname(__filename)),
  config => {
    let serverStarted = false;

    const start = () => {
      if (serverStarted) {
        server.restart();
      } else {
        server.listen(
          {
            path: config.path,
          },
          err => {
            if (!err) {
              serverStarted = true;
            }
          },
        );
      }
    };

    const watch = gulp.parallel(start, watchUtil(config.watch || config.path, start));
    watch.displayName = 'server:watch';

    return {
      start,
      watch,
    };
  },
  {
    configValidator: objectPropertiesValidatorFactory(['path']),
  },
);
