import { promisify } from 'util';

import { Router } from 'express';
import multer from 'multer';

import config from '../../../../config.json';
import jwtAuthMiddleware from '../../../middleware/express/jwtAuth';
import { gifById } from '../../common/handlers/gifs';
import { ownedByUser } from '../../common/validators/gifs';

import { addGifByUpload, addGifByUrl, deleteGif, getGifs, updateGif } from './handlers';
import likes from './likes';
import { validateGifCreationByUrl, validateGifId, validateGifUpdate } from './validators';

const router = Router();
const upload = multer({ dest: config.dirs.uploadDir });

const promisifiedUploadGif = promisify(upload.single('gif'));
const promisifiedValidateGifCreate = promisify(validateGifCreationByUrl);

router.param('id', gifById);

router.use('/:id/likes', validateGifId, likes);

router.get('/', getGifs);

router.post('/', jwtAuthMiddleware, async (req, res, next) => {
  await promisifiedUploadGif(req, res);
  if (req.file) {
    return addGifByUpload(req, res, next);
  } else {
    await promisifiedValidateGifCreate(req, res);
    return addGifByUrl(req, res, next);
  }
});

router.patch('/:id', validateGifId, jwtAuthMiddleware, validateGifUpdate, ownedByUser, updateGif);

router.delete('/:id', validateGifId, jwtAuthMiddleware, ownedByUser, deleteGif);

export default router;
