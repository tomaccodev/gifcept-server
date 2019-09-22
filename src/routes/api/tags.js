const { Router } = require('express');

const { Tag } = require('../../models');

const router = new Router();

const PAGE_SIZE = 20;

/**
 * Route: /api/tags
 * Method: GET
 *
 * Retrieves a list of tags
 */
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find({}).limit(PAGE_SIZE);
    return res.send(tags);
  } catch (err) {
    return res.errorHandler(err);
  }
});

module.exports = router;
