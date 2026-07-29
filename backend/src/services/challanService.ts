import { ChallanStatus, MovementType, NotificationType } from '@prisma/client';
import { prisma } from '../config/db.js';
import { generateChallanPDF } from '../utils/pdfGenerator.js';

export class ChallanService {
  static async getChallans(params: { search?: string; status?: ChallanStatus; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { challanNo: { contains: params.search, mode: 'insensitive' } },
        { customer: { name: { contains: params.search, mode: 'insensitive' } } },
        { customer: { company: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, company: true, email: true } },
          user: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return {
      challans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { name: true, role: true, email: true } },
        items: true,
      },
    });

    if (!challan) throw new Error('Sales Challan not found');
    return challan;
  }

  static async createChallan(data: {
    customerId: string;
    notes?: string | null;
    tax?: number;
    status?: ChallanStatus;
    items: Array<{ productId: string; quantity: number }>;
  }, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error('Customer not found');

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.salesChallan.count();
    const challanNo = `CHL-${dateStr}-${(count + 1).toString().padStart(3, '0')}`;

    // Fetch product details for snapshotting
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const itemCreates = data.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) throw new Error(`Product ID ${item.productId} not found`);

      const lineTotal = prod.price * item.quantity;
      subtotal += lineTotal;

      return {
        productId: prod.id,
        skuSnapshot: prod.sku,
        nameSnapshot: prod.name,
        priceSnapshot: prod.price,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const taxAmount = (subtotal * (data.tax || 0)) / 100;
    const total = subtotal + taxAmount;

    const challan = await prisma.salesChallan.create({
      data: {
        challanNo,
        customerId: data.customerId,
        userId,
        status: ChallanStatus.DRAFT,
        subtotal,
        tax: taxAmount,
        total,
        notes: data.notes,
        items: {
          create: itemCreates,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          entity: 'Sales Challan',
          action: 'CREATED_DRAFT',
          details: `Created draft Sales Challan ${challan.challanNo} for ${customer.name} ($${total.toFixed(2)})`,
        },
      });
    }

    if (data.status && data.status !== ChallanStatus.DRAFT) {
      return await ChallanService.updateChallanStatus(challan.id, data.status, userId);
    }

    return challan;
  }

  static async updateChallanStatus(id: string, newStatus: ChallanStatus, userId: string) {
    const existing = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });

    if (!existing) throw new Error('Sales Challan not found');
    if (existing.status === newStatus) return existing;
    if ((existing.status === ChallanStatus.CONFIRMED || existing.status === ChallanStatus.DELIVERED) && newStatus === ChallanStatus.DRAFT) {
      throw new Error('Cannot revert a confirmed/delivered sales challan back to draft');
    }

    return prisma.$transaction(async (tx) => {
      const needsStockDeduction = existing.status === ChallanStatus.DRAFT && (newStatus === ChallanStatus.CONFIRMED || newStatus === ChallanStatus.DELIVERED);
      if (needsStockDeduction) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.skuSnapshot} not found`);

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}" (${product.sku}). Available: ${product.stock}, Required: ${item.quantity}`
            );
          }

          // Deduct stock
          const updatedStock = product.stock - item.quantity;
          await tx.product.update({
            where: { id: product.id },
            data: { stock: updatedStock },
          });

          // Log inventory movement
          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              warehouseId: product.warehouseId,
              userId,
              type: MovementType.OUT,
              quantity: item.quantity,
              reason: `Sales Challan Fulfillment (#${existing.challanNo})`,
              referenceNo: existing.challanNo,
            },
          });

          // Low stock alert check
          if (updatedStock <= product.minStock) {
            await tx.notification.create({
              data: {
                title: 'Low Stock Alert',
                message: `Product "${product.name}" stock reduced to ${updatedStock} after Challan confirmation.`,
                type: NotificationType.LOW_STOCK,
                link: `/products/${product.id}`,
              },
            });
          }
        }
      }

      const needsStockRestore = (existing.status === ChallanStatus.CONFIRMED || existing.status === ChallanStatus.DELIVERED) && newStatus === ChallanStatus.CANCELLED;
      if (needsStockRestore) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { stock: product.stock + item.quantity },
            });

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                warehouseId: product.warehouseId,
                userId,
                type: MovementType.IN,
                quantity: item.quantity,
                reason: `Sales Challan Cancellation (#${existing.challanNo})`,
                referenceNo: existing.challanNo,
              },
            });
          }
        }
      }

      const updated = await tx.salesChallan.update({
        where: { id },
        data: {
          status: newStatus,
          confirmedAt: newStatus === ChallanStatus.CONFIRMED ? new Date() : existing.confirmedAt,
        },
        include: { customer: true, items: true },
      });

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        await tx.activityLog.create({
          data: {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            entity: 'Sales Challan',
            action: `STATUS_${newStatus}`,
            details: `Updated Challan ${existing.challanNo} status from ${existing.status} to ${newStatus}`,
          },
        });
      }

      return updated;
    });
  }

  static async getPDF(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });

    if (!challan) throw new Error('Sales Challan not found');

    return generateChallanPDF({
      challanNo: challan.challanNo,
      customerName: challan.customer.name,
      customerCompany: challan.customer.company,
      customerAddress: challan.customer.address,
      customerCity: challan.customer.city,
      status: challan.status,
      createdAt: challan.createdAt,
      subtotal: challan.subtotal,
      tax: challan.tax,
      total: challan.total,
      notes: challan.notes,
      items: challan.items,
    });
  }
}
