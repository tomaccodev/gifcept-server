import { Router } from 'express';

import auth from './auth';
import gifs from './gifs';
import me from './me';
import tags from './tags';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/gifs', gifs);
router.use('/me', me);
router.use('/tags', tags);
router.use('/users', users);

export default router;
