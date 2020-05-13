import { Router } from 'express';

import gifs from './gifs';
import { byTag } from './handlers';

const router = Router();

router.param('tag', byTag);

router.use('/:tag/gifs', gifs);

export default router;
