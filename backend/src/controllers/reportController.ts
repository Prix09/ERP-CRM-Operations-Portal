import { Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService.js';
import { AuthRequest } from '../types/index.js';

export class ReportController {
  static async getDashboardAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getDashboardAnalytics();
      res.status(200).json({ success: true, message: 'Dashboard analytics retrieved', data });
    } catch (err) {
      next(err);
    }
  }

  static async getSalesReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getSalesReport();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getInventoryReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getInventoryReport();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerReport(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getCustomerReport();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
