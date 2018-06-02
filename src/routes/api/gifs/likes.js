const express = require('express');
const { Types } = require('mongoose');

const { Gif } = require('../../../models');
const { InternalServerError, BadRequest } = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');

const router = new express.Router();

/**
 * Route: /api/gifs/:id/likes
 * Method: POST
 *
 * Adds a new like to a given gif if token user did not already like it
 */
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the gif is already liked by current user
    const gif = await Gif.findOne({
      // eslint-disable-next-line no-underscore-dangle
      _id: req.gif._id,
      likes: { $elemMatch: { user: Types.ObjectId(req.user.id) } },
    });

    if (gif) {
      return res.errorHandler(new BadRequest());
    }

    req.gif.likes.push({
      user: Types.ObjectId(req.user.id),
    });

    await req.gif.save();

    return res.send();
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/gifs/:id/likes
 * Method: DELETE
 *
 * Removes a like from a gif if token user liked it
 */
router.delete('/', jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the gif is already liked by current user
    const gif = await Gif.findOne({
      // eslint-disable-next-line no-underscore-dangle
      _id: req.gif._id,
      likes: { $elemMatch: { user: Types.ObjectId(req.user.id) } },
    });

    if (!gif) {
      return res.errorHandler(new BadRequest());
    }

    const like = gif.likes.find(l => l.user.equals(req.user.id));
    // eslint-disable-next-line no-underscore-dangle
    req.gif.likes.id(like._id).remove();
    await req.gif.save();

    return res.send();
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
