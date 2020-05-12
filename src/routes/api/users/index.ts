import { Router } from 'express';

import { userById } from '../../common/handlers/users';

import gifs from './gifs';

const router = Router();

router.param('id', userById);

router.use('/:id/gifs', gifs);

export default router;
