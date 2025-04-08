import express from 'express';
import multer from 'multer';
import {
  uploadImages,
  getCollageStatus,
  cancelCollageRequest,
  getAllRequests,
} from '../controllers/imagecontroller';
import { getJobStatus } from '../controllers/requestcontroller';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.array('images', 3), uploadImages);
router.get('/collages/:requestId', getCollageStatus);
router.post('/cancel/:requestId', cancelCollageRequest);
router.get('/collages/:jobId', getJobStatus);
router.get('/collages', getAllRequests);

export default router;
