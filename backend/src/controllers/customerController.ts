import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService.js';
import { AuthRequest } from '../types/index.js';
import { exportToCsv } from '../utils/csvExporter.js';

export class CustomerController {
  static async getCustomers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const type = req.query.type as any;
      const status = req.query.status as any;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await CustomerService.getCustomers({ search, type, status, page, limit });
      res.status(200).json({ success: true, message: 'Customers retrieved', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      res.status(200).json({ success: true, message: 'Customer details retrieved', data: customer });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Customer updated', data: customer });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await CustomerService.deleteCustomer(req.params.id);
      res.status(200).json({ success: true, message: 'Customer deleted' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async addNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const note = await CustomerService.addNote(req.params.id, req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Customer note added', data: note });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async exportCsv(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CustomerService.getCustomers({ limit: 1000 });
      const csvData = result.customers.map((c) => ({
        ID: c.id,
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        Company: c.company || 'N/A',
        City: c.city,
        Type: c.type,
        Status: c.status,
        CreatedAt: c.createdAt.toISOString(),
      }));

      const csv = exportToCsv(csvData);
      res.header('Content-Type', 'text/csv');
      res.attachment(`customers_export_${Date.now()}.csv`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
