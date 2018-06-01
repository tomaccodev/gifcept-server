const gulp = require('gulp');
const watch = require('gulp-watch');

/**
 * @param {string|[string]} toWatch
 * @param {string|function} action function or gulp task to execute
 * @param {[string]} exclude
 */
module.exports = (toWatch, action, { exclude = ['**/*___jb_tmp___'] } = {}) => () =>
  watch(
    // Ensure it is an array and concat excluded resources
    (Array.isArray(toWatch) ? Array.from(toWatch) : [toWatch]).concat(
      exclude.map(glob => `!${glob}`),
    ),
    typeof action === 'function' ? action : () => gulp.start(action),
  );
