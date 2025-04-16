import express from 'express';
import multer from 'multer';
import {
  uploadImages,
  getCollageStatus,
  cancelCollageRequest,
  getAllRequests,
} from '../controllers/requestController';

const router = express.Router();
const upload = multer();

router.post('/requests/upload', upload.array('images', 3), uploadImages);
router.get('/requests', getAllRequests);
router.get('/requests/:requestId', getCollageStatus);
router.post('/requests/cancel/:requestId/', cancelCollageRequest);

export default router;
