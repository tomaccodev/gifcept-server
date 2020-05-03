import { Router } from 'express';

import auth from './auth';
import gifs from './gifs';
import me from './me';

const router = Router();

router.use('/auth', auth);
router.use('/gifs', gifs);
router.use('/me', me);

export default router;
