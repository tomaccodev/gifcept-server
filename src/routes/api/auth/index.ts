import { Router } from 'express';

import token from './token';

const router = Router();

router.use('/token', token);

export default router;
