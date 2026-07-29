import { Router } from 'express';
import { Role } from '@prisma/client';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createUserSchema, updateUserSchema } from '../validation/userSchemas.js';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/', UserController.getUsers);
router.post('/', validateRequest(createUserSchema), UserController.createUser);
router.put('/:id', validateRequest(updateUserSchema), UserController.updateUser);

export default router;
