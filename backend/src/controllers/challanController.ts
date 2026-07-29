import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challanService.js';
import { AuthRequest } from '../types/index.js';

export class ChallanController {
  static async getChallans(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const status = req.query.status as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ChallanService.getChallans({ search, status, page, limit });
      res.status(200).json({ success: true, message: 'Sales Challans retrieved', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getChallanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      res.status(200).json({ success: true, message: 'Challan details retrieved', data: challan });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createChallan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const challan = await ChallanService.createChallan(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Sales Challan created successfully', data: challan });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const updated = await ChallanService.updateChallanStatus(req.params.id, status, req.user!.userId);
      res.status(200).json({ success: true, message: `Challan status updated to ${status}`, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async downloadPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pdfBuffer = await ChallanService.getPDF(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="challan_${req.params.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
