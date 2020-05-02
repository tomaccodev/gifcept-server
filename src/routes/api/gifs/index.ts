import { Router } from 'express';
import multer from 'multer';
import { promisify } from 'util';

import config from '../../../../config.json';
import jwtAuthMiddleware from '../../../middleware/express/jwtAuth';
import { gifById } from '../../common/handlers/gifs';
import { ownedByUser } from '../../common/validators/gifs';

import { addGifByUpload, addGifByUrl, getGifs, updateGif } from './handlers';
import { validateGifCreationByUrl, validateGifUpdate } from './validators';

const router = Router();
const upload = multer({ dest: config.dirs.uploadDir });

const promisifiedUploadGif = promisify(upload.single('gif'));
const promisifiedValidateGifCreate = promisify(validateGifCreationByUrl);

router.param('id', gifById);

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

router.patch('/:id', jwtAuthMiddleware, validateGifUpdate, ownedByUser, updateGif);

export default router;
