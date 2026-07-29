import { Router } from 'express';
import { Role } from '@prisma/client';
import { InventoryController } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createInventoryMovementSchema } from '../validation/inventorySchemas.js';

const router = Router();

router.use(authenticate);

router.get('/logs', InventoryController.getLogs);
router.get('/export/csv', InventoryController.exportCsv);
router.post(
  '/movements',
  authorize([Role.ADMIN, Role.WAREHOUSE]),
  validateRequest(createInventoryMovementSchema),
  InventoryController.createMovement
);

export default router;
