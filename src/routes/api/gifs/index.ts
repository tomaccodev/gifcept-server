import { Router } from 'express';

import jwtAuthMiddleware from '../../../middleware/express/jwtAuth';
import { gifByShortId } from '../../common/handlers/gifs';

import { addGif, getGifs } from './handlers';
import { validateGifCreation } from './validators';

const router = Router();

router.param('id', gifByShortId);

router.get('/', getGifs);

router.post('/', jwtAuthMiddleware, validateGifCreation, addGif);

export default router;
