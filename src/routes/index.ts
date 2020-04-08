import { Router } from 'express';

import api from './api';
import images from './images';

const router = Router();

router.use('/api', api);

router.use(images);

export default router;
