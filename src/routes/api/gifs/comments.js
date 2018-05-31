const express = require('express');

const { InternalServerError, BadRequest } = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');
const userMiddleware = require('../../../middlewares/express/user');

const router = new express.Router();

/**
 * Route: /api/gifs/:id/comments
 * Method: GET
 *
 * Retrieves the lists of comments for a given gif
 */
router.get('/:id/comments', async (req, res) => {
  try {
    await req.season.populate('comments.author').execPopulate();

    return res.send(req.comments);
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/gifs/:id/comments
 * Method: POST
 *
 * Adds a new comment to a given gif
 */
router.post('/:id/comments', jwtAuthMiddleware, userMiddleware, async (req, res) => {
  try {
    if (req.body.comment) {
      req.gif.comments.push({
        text: req.body.comment,
        author: req.user,
      });

      await req.season.save();

      const itemIndex = req.gif.comments.length - 1;
      await req.gif.populate(`comments.${itemIndex}.author`).execPopulate();

      const item = req.gif.comments[itemIndex].toJSON();

      return res.send(item);
    }
    return res.errorHandler(new BadRequest());
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
