import { Router } from 'express';

import { gifByShortId } from '../common/handlers/gifs';

import { serveImage } from './handlers';

const router = Router();

router.param('id', gifByShortId);

router.get('/:id.(gif|jpg)', serveImage);

export default router;
