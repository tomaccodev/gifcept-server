import { body } from 'express-validator';

export const validateCommentCreation = body('comment').exists();
