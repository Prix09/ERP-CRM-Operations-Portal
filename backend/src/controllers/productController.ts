import { Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { AuthRequest } from '../types/index.js';
import { exportToCsv } from '../utils/csvExporter.js';

export class ProductController {
  static async getProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const warehouseId = req.query.warehouseId as string;
      const lowStock = req.query.lowStock === 'true';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ProductService.getProducts({ search, categoryId, warehouseId, lowStock, page, limit });
      res.status(200).json({ success: true, message: 'Products retrieved', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json({ success: true, message: 'Product details retrieved', data: product });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body, req.user!.userId);
      res.status(200).json({ success: true, message: 'Product updated', data: product });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteProduct(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProductService.deleteProduct(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getCategories(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  static async getWarehouses(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouses = await ProductService.getWarehouses();
      res.status(200).json({ success: true, data: warehouses });
    } catch (err) {
      next(err);
    }
  }

  static async exportCsv(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts({ limit: 1000 });
      const csvData = result.products.map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category?.name || 'Uncategorized',
        Warehouse: p.warehouse?.name || 'N/A',
        Price: p.price,
        CostPrice: p.costPrice,
        Stock: p.stock,
        MinStock: p.minStock,
        Unit: p.unit,
        Barcode: p.barcode || 'N/A',
      }));

    const csv = exportToCsv(csvData);
      res.header('Content-Type', 'text/csv');
      res.attachment(`products_export_${Date.now()}.csv`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  static async addStockMovement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ProductService.addStockMovement(id, req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Stock movement added', data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStockMovement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, movementId } = req.params;
      const result = await ProductService.updateStockMovement(id, movementId, req.body, req.user!.userId);
      res.status(200).json({ success: true, message: 'Stock movement updated', data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async uploadImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image uploaded' });
        return;
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { imageUrl } });
    } catch (err) {
      next(err);
    }
  }
}
