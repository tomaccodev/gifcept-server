const express = require('express');
const { Types } = require('mongoose');

const { InternalServerError } = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');

const router = new express.Router();

/**
 * Route: /api/gifs/:id/likes
 * Method: POST
 *
 * Adds a new like to a given gif
 */
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    await req.gif
      .populate({
        path: 'likes.user',
        select: 'username _id',
        match: { _id: req.user.id },
      })
      .execPopulate();

    // req.gif.likes = req.gif.likes.filter(l => l.user !== null);

    console.log(req.gif.likes, req.user, typeof Types.ObjectId(req.user.id));
    req.gif.likes.push({
      user: Types.ObjectId(req.user.id),
    });

    await req.gif.save();

    return res.send();
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
