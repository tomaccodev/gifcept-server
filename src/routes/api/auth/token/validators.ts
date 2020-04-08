import { check } from 'express-validator';

export const validateTokenCreation = [check('email').isEmail(), check('password').exists()];
