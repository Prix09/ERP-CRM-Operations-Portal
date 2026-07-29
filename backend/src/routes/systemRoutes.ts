import { Router } from 'express';
import { SystemController } from '../controllers/systemController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/search', SystemController.globalSearch);

export default router;
