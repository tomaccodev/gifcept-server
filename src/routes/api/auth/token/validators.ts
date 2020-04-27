import { body } from 'express-validator';

export const validateTokenCreation = [body('email').isEmail(), body('password').exists()];
