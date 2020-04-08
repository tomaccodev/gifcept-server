import { Router } from 'express';

import auth from './auth';
import gifs from './gifs';

const router = Router();

router.use('/auth', auth);
router.use('/gifs', gifs);

export default router;
