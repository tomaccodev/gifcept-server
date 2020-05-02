import { body, oneOf } from 'express-validator';

export const validateGifCreationByUrl = body('url').isURL();

export const validateGifUpdate = oneOf([body('description').isString(), body('tags.*').isString()]);
