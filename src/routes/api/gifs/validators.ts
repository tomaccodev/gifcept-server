import { body, oneOf, param } from 'express-validator';

import { Rating } from '../../../models/common/constants';

export const validateGifId = param('id').isMongoId();

export const validateGifCreationByUrl = body('url').isURL();

export const validateGifUpdate = oneOf([
  body('description').isString(),
  body('rating').isIn(Object.values(Rating)),
  body('tags.*').isString(),
]);
