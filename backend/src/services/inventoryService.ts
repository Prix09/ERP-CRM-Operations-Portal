import { MovementType, NotificationType } from '@prisma/client';
import { prisma } from '../config/db.js';

export class InventoryService {
  static async getLogs(params: { search?: string; productId?: string; type?: MovementType; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.productId) where.productId = params.productId;
    if (params.type) where.type = params.type;

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { name: true, code: true } },
          user: { select: { name: true, role: true } },
        },
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    return {
      logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createMovement(data: {
    productId: string;
    warehouseId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    referenceNo?: string | null;
  }, userId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new Error('Product not found');

      let newStock = product.stock;
      if (data.type === MovementType.IN) {
        newStock += data.quantity;
      } else if (data.type === MovementType.OUT) {
        if (product.stock < data.quantity) {
          throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${data.quantity}`);
        }
        newStock -= data.quantity;
      } else if (data.type === MovementType.ADJUSTMENT) {
        newStock = data.quantity; // Direct adjustment to new value
      } else if (data.type === MovementType.TRANSFER) {
        if (product.stock < data.quantity) {
          throw new Error(`Insufficient stock for transfer. Available: ${product.stock}`);
        }
        newStock -= data.quantity;
      }

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      });

      // Create log
      const log = await tx.inventoryLog.create({
        data: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          userId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          referenceNo: data.referenceNo,
        },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { name: true } },
          user: { select: { name: true } },
        },
      });

      // Check for low stock warning
      if (updatedProduct.stock <= updatedProduct.minStock) {
        await tx.notification.create({
          data: {
            title: 'Critical Low Stock Warning',
            message: `Product "${updatedProduct.name}" (${updatedProduct.sku}) stock dropped to ${updatedProduct.stock} (Min: ${updatedProduct.minStock}).`,
            type: NotificationType.LOW_STOCK,
            link: `/products/${updatedProduct.id}`,
          },
        });
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        await tx.activityLog.create({
          data: {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            entity: 'Inventory',
            action: `STOCK_${data.type}`,
            details: `${data.type} movement of ${data.quantity} units for ${updatedProduct.name}`,
          },
        });
      }

      return log;
    });
  }
}
