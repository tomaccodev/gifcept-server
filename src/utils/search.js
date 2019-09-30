module.exports = {
  gifQueryFromRequest: req => {
    if (req.query) {
      const { before, user, search, ratings, order } = req.query;

      return {
        before,
        user,
        search,
        ratings,
        order,
      };
    }

    return {};
  },
};
