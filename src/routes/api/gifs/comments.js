const express = require('express');
const { Types } = require('mongoose');

const { InternalServerError, BadRequest } = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');

const router = new express.Router();

/**
 * Route: /api/gifs/:id/comments
 * Method: GET
 *
 * Retrieves the lists of comments for a given gif
 */
router.get('/', async (req, res) => {
  try {
    await req.gif.populate('comments.author').execPopulate();

    return res.send(req.gif.comments);
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
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (req.body.comment) {
      req.gif.comments.push({
        text: req.body.comment,
        user: Types.ObjectId(req.user.id),
      });

      await req.gif.save();

      const itemIndex = req.gif.comments.length - 1;
      await req.gif.populate(`comments.${itemIndex}.user`).execPopulate();

      const item = req.gif.comments[itemIndex].toJSON();

      return res.send(item);
    }
    return res.errorHandler(new BadRequest());
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
