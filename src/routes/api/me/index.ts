import { Router } from 'express';

import jwtAuthMiddleware from '../../../middleware/express/jwtAuth';

import { getUserTags } from './handlers';

const router = Router();

router.get('/tags', jwtAuthMiddleware, getUserTags);

export default router;
