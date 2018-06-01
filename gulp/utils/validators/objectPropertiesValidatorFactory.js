module.exports = properties => obj =>
  typeof obj === 'object' &&
  properties.every(property => Object.prototype.hasOwnProperty.call(obj, property));
