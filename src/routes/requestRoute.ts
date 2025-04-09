import express from 'express';
import multer from 'multer';
import {
  uploadImages,
  getCollageStatus,
  cancelCollageRequest,
  getAllRequests,
} from '../controllers/requestController';
import { getJobStatus } from '../controllers/jobStatusController';

const router = express.Router();
const upload = multer();

router.post('/requests/upload', upload.array('images', 3), uploadImages);
router.get('/requests', getAllRequests);
router.get('/requests/:requestId', getCollageStatus);
router.post('/requests/:requestId/cancel', cancelCollageRequest);
router.get('/jobs/:jobId/status', getJobStatus);

export default router;
