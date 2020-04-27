import { body, oneOf } from 'express-validator';

export const validateGifCreation = oneOf([body('url').isURL()]);
