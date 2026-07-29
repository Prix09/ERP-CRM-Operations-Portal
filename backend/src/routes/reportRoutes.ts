import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', ReportController.getDashboardAnalytics);
router.get('/sales', ReportController.getSalesReport);
router.get('/inventory', ReportController.getInventoryReport);
router.get('/customers', ReportController.getCustomerReport);

export default router;
