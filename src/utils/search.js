module.exports = {
  gifQueryMetadataFromRequest: req => {
    const criteria = {};
    if (req.query) {
      if (req.query.before) {
        criteria.before = req.query.before;
      }
      if (req.query.search) {
        criteria.search = req.query.search;
      }
    }
    if (req.user) {
      // eslint-disable-next-line no-underscore-dangle
      criteria.user = req.user._id;
    }

    return {
      criteria,
      sort: req.query && req.query.sort,
    };
  },
};
