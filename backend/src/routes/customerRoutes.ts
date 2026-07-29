import { Router } from 'express';
import { Role } from '@prisma/client';
import { CustomerController } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createCustomerSchema, updateCustomerSchema, addCustomerNoteSchema } from '../validation/customerSchemas.js';

const router = Router();

router.use(authenticate);

router.get('/', CustomerController.getCustomers);
router.get('/export/csv', CustomerController.exportCsv);
router.get('/:id', CustomerController.getCustomerById);

router.post('/', authorize([Role.ADMIN, Role.SALES]), validateRequest(createCustomerSchema), CustomerController.createCustomer);
router.put('/:id', authorize([Role.ADMIN, Role.SALES]), validateRequest(updateCustomerSchema), CustomerController.updateCustomer);
router.delete('/:id', authorize([Role.ADMIN]), CustomerController.deleteCustomer);
router.post('/:id/notes', authorize([Role.ADMIN, Role.SALES]), validateRequest(addCustomerNoteSchema), CustomerController.addNote);

export default router;
