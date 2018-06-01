const path = require('path');

const rootPath = './';
const backendSrc = path.join(rootPath, 'src');
const excluded = path.resolve(backendSrc, 'public');

module.exports = {
  server: {
    path: path.join(backendSrc, 'server.js'),
    watch: [path.join(backendSrc, '**', '*.js'), `!${path.join(excluded, 'js', '**', '*.js')}`],
  },
};
