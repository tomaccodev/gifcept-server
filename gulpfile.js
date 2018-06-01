const gulp = require('gulp');
const config = require('./gulp/config');
const tasks = require('./gulp/tasks')(config);

// Helper tasks
gulp.task('watch', tasks.server.watch);
