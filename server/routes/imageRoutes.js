import express from 'express';
import { getUploadURL } from '../controllers/imageController.js';

const router = express.Router();

router.get('/get-upload-url', getUploadURL);

export default router;
