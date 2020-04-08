import { check } from 'express-validator';

export const validateCommentCreation = check('comment').exists();
