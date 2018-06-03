const express = require('express');
const { Types } = require('mongoose');

const { User } = require('../../../models');
const {
  InternalServerError,
  BadRequest,
  NotFound,
  Unauthorized,
} = require('../../../error/httpStatusCodeErrors');
const jwtAuthMiddleware = require('../../../middlewares/express/jwt-auth');

const router = new express.Router();

const serializeComment = async comment => {
  const user = await User.findOne({ _id: comment.user });

  const { _id, text, created } = comment;

  return {
    id: _id,
    text,
    user: {
      id: user.id,
      username: user.username,
    },
    created,
  };
};

/**
 * Route: /api/gifs/:id/comments
 * Method: GET
 *
 * Retrieves the lists of comments for a given gif
 */
router.get('/', async (req, res) => {
  try {
    await req.gif.populate('comments.author').execPopulate();

    return res.send(await Promise.all(req.gif.comments.map(c => serializeComment(c))));
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
    if (!req.body.comment) {
      return res.errorHandler(new BadRequest());
    }

    req.gif.comments.push({
      text: req.body.comment.trim(),
      user: Types.ObjectId(req.user.id),
    });

    await req.gif.save();

    const commentIndex = req.gif.comments.length - 1;
    await req.gif.populate(`comments.${commentIndex}.user`).execPopulate();

    const comment = req.gif.comments[commentIndex];

    return res.send(await serializeComment(comment));
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/gifs/:id/comments/:id
 * Method: DELETE
 *
 * Deletes a give comment
 */
router.delete('/:id', jwtAuthMiddleware, async (req, res) => {
  try {
    const comment = req.gif.comments.id(req.params.id);

    if (!comment) {
      return res.errorHandler(NotFound());
    }

    if (!comment.user.equals(req.user.id)) {
      return res.errorHandler(new Unauthorized());
    }

    comment.remove();
    await req.gif.save();

    return res.send();
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

/**
 * Route: /api/gifs/:id/comments/:id
 * Method: PATCH
 *
 * Updates a given comment
 */
router.patch('/:id', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!req.body.comment) {
      return res.errorHandler(new BadRequest());
    }
    const comment = req.gif.comments.id(req.params.id);

    if (!comment) {
      return res.errorHandler(NotFound());
    }

    if (!comment.user.equals(req.user.id)) {
      return res.errorHandler(new Unauthorized());
    }

    comment.text = req.body.comment.trim();
    await req.gif.save();

    return res.send(await serializeComment(comment));
  } catch (err) {
    return res.errorHandler(new InternalServerError(err));
  }
});

module.exports = router;
