module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'function-paren-newline': ['error', 'consistent'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': ['gulp/**/*.js', 'gulpfile.js']
      }
    ]
  },
};
