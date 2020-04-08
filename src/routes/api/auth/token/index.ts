import { Router } from 'express';

import { createToken } from './handlers';
import { validateTokenCreation } from './validators';

const router = Router();

/**
 * Route: /api/auth/token
 * Method: POST
 *
 * Authenticates an user and returns a jwt if successful
 */
router.post('/', validateTokenCreation, createToken);

export default router;
