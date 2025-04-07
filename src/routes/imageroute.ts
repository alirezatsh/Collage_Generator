import express from 'express';
import multer from 'multer';
import { uploadImages } from '../controllers/imagecontroller';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.array('images', 3), uploadImages);

export default router;
