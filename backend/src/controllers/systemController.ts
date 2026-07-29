import { Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../types/index.js';

export class SystemController {
  static async globalSearch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim() || query.length < 2) {
        res.status(200).json({ success: true, data: { customers: [], products: [], challans: [], users: [] } });
        return;
      }

      const q = query.trim();

      const [customers, products, challans, users] = await Promise.all([
        prisma.customer.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { company: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, name: true, company: true, email: true, type: true },
        }),
        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { barcode: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, sku: true, name: true, price: true, stock: true },
        }),
        prisma.salesChallan.findMany({
          where: {
            OR: [
              { challanNo: { contains: q, mode: 'insensitive' } },
              { customer: { name: { contains: q, mode: 'insensitive' } } },
            ],
          },
          take: 5,
          select: { id: true, challanNo: true, status: true, total: true, createdAt: true },
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 3,
          select: { id: true, name: true, email: true, role: true },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          customers,
          products,
          challans,
          users,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
