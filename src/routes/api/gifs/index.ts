import { Router } from 'express';
import multer from 'multer';
import { promisify } from 'util';

import config from '../../../../config.json';
import { ClientErrorBadRequest } from '../../../error/httpException';
import jwtAuthMiddleware from '../../../middleware/express/jwtAuth';
import { gifByShortId } from '../../common/handlers/gifs';

import { addGifByUpload, addGifByUrl, getGifs } from './handlers';
import { validateGifCreation } from './validators';

const router = Router();
const upload = multer({ dest: config.dirs.uploadDir });

const promisifiedUploadGif = promisify(upload.single('gif'));
const promisifiedValidateGifCreate = promisify(validateGifCreation);

router.param('id', gifByShortId);

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
router.post('/', jwtAuthMiddleware, validateGifCreation, addGifByUrl);

export default router;
