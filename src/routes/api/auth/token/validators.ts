import { body } from 'express-validator';

export const validateTokenCreation = [
  body('usernameOrEmail').isString(),
  body('password').exists(),
];
