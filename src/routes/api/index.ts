import { Router } from 'express';

import auth from './auth';
import gifs from './gifs';
import me from './me';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/gifs', gifs);
router.use('/me', me);
router.use('/users', users);

export default router;
