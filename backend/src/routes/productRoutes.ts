import { Router } from 'express';
import { Role } from '@prisma/client';
import { ProductController } from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createProductSchema, updateProductSchema } from '../validation/productSchemas.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = Router();

router.use(authenticate);

router.get('/', ProductController.getProducts);
router.get('/export/csv', ProductController.exportCsv);
router.get('/meta/categories', ProductController.getCategories);
router.get('/meta/warehouses', ProductController.getWarehouses);
router.get('/:id', ProductController.getProductById);

router.post('/upload', authorize([Role.ADMIN, Role.WAREHOUSE]), upload.single('image'), ProductController.uploadImage);

router.post('/', authorize([Role.ADMIN, Role.WAREHOUSE]), validateRequest(createProductSchema), ProductController.createProduct);
router.put('/:id', authorize([Role.ADMIN, Role.WAREHOUSE]), validateRequest(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authorize([Role.ADMIN]), ProductController.deleteProduct);

// Stock movements
router.post('/:id/movement', authorize([Role.ADMIN, Role.WAREHOUSE]), ProductController.addStockMovement);
router.put('/:id/movement/:movementId', authorize([Role.ADMIN, Role.WAREHOUSE]), ProductController.updateStockMovement);

export default router;
