import { Router } from 'express';

import jwtAuthMiddleware from '../../../../middleware/express/jwtAuth';

import { addLike, removeLike } from './handlers';

const router = Router();

router.post('/', jwtAuthMiddleware, addLike);

router.delete('/', jwtAuthMiddleware, removeLike);

export default router;
