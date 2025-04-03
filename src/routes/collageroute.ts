import { Router } from 'express';
import {
  createCollageRequest,
  getCollageRequests,
  getCollageRequestById,
  deleteCollageRequest,
} from '../controllers/collagecontrller';

const router = Router();

router.post('/', createCollageRequest);
router.get('/', getCollageRequests);
router.get('/:id', getCollageRequestById);
router.delete('/:id', deleteCollageRequest);

export default router;
