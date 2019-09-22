const { Router } = require('express');
const { Types } = require('mongoose');

const {
  InternalServerError,
  BadRequest,
} = require('@danilupion/server-utils/error/httpStatusCodeErrors');
const {
  middleware: jwtAuthMiddleware,
} = require('@danilupion/server-utils/middlewares/express/jwt-auth');

const router = new Router();

/**
 * Route: /api/gifs/:id/likes
 * Method: POST
 *
 * Adds a new like to a given gif if token user did not already like it
 */
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    // Check if the gif is already liked by current user
    const like = req.gif.likes.find(l => l.user.equals(req.user.id));

    if (like) {
      return res.errorHandler(new BadRequest());
    }

    req.gif.likes.push({
      user: Types.ObjectId(req.user.id),
    });
    req.gif.likesCount = req.gif.likes.length;

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
    const like = req.gif.likes.find(l => l.user.equals(req.user.id));

    if (!like) {
      return res.errorHandler(new BadRequest());
    }

    // eslint-disable-next-line no-underscore-dangle
    req.gif.likes.id(like._id).remove();
    req.gif.likesCount = req.gif.likes.length;
    await req.gif.save();

    return res.send();
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
