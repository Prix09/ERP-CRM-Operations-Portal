import { Router } from 'express';
import { Role } from '@prisma/client';
import { ChallanController } from '../controllers/challanController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createChallanSchema, updateChallanStatusSchema } from '../validation/challanSchemas.js';

const router = Router();

router.use(authenticate);

router.get('/', ChallanController.getChallans);
router.get('/:id', ChallanController.getChallanById);
router.get('/:id/pdf', ChallanController.downloadPDF);

router.post(
  '/',
  authorize([Role.ADMIN, Role.SALES]),
  validateRequest(createChallanSchema),
  ChallanController.createChallan
);

router.patch(
  '/:id/status',
  authorize([Role.ADMIN, Role.SALES, Role.WAREHOUSE]),
  validateRequest(updateChallanStatusSchema),
  ChallanController.updateStatus
);

export default router;
