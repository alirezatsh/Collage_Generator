import express from 'express';
import { getLogsByRequestId, getAllLogs } from '../controllers/logController';

const router = express.Router();

router.get('/logs', getAllLogs);
router.get('/logs/:requestId', getLogsByRequestId);

export default router;
