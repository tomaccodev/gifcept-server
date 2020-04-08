import { Router } from 'express';

import { gifByShortId } from '../../common/handlers/gifs';

import { getGifs } from './handlers';

const router = Router();

router.param('id', gifByShortId);

router.get('/', getGifs);

export default router;
