import { Router } from 'express';

import { userByUsername } from '../../common/handlers/users';

import gifs from './gifs';

const router = Router();

router.param('id', userByUsername);

router.use('/:id/gifs', gifs);

export default router;
