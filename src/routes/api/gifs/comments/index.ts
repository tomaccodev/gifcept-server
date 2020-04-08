import { Router } from 'express';

import jwtAuthMiddleware from '../../../../middleware/express/jwtAuth';

import { addComment, getGifComments, removeComment } from './handlers';
import { validateCommentCreation } from './validators';

const router = Router();

router.get('/', getGifComments);

router.post('/', jwtAuthMiddleware, validateCommentCreation, addComment);

router.delete('/', jwtAuthMiddleware, removeComment);

export default router;
