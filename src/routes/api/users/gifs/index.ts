import { Router } from 'express';

import { getGifs } from '../../gifs/handlers';

const router = Router();

router.use('/', getGifs);

export default router;
