import { Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService.js';
import { AuthRequest } from '../types/index.js';
import { exportToCsv } from '../utils/csvExporter.js';

export class InventoryController {
  static async getLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const productId = req.query.productId as string;
      const type = req.query.type as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await InventoryService.getLogs({ search, productId, type, page, limit });
      res.status(200).json({ success: true, message: 'Inventory logs retrieved', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async createMovement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await InventoryService.createMovement(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Inventory movement recorded', data: log });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async exportCsv(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await InventoryService.getLogs({ limit: 1000 });
      const csvData = result.logs.map((l) => ({
        ID: l.id,
        Timestamp: l.createdAt.toISOString(),
        ProductSKU: l.product?.sku,
        ProductName: l.product?.name,
        MovementType: l.type,
        Quantity: l.quantity,
        Warehouse: l.warehouse?.name,
        User: l.user?.name,
        Reason: l.reason,
        ReferenceNo: l.referenceNo || 'N/A',
      }));

      const csv = exportToCsv(csvData);
      res.header('Content-Type', 'text/csv');
      res.attachment(`inventory_logs_${Date.now()}.csv`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
