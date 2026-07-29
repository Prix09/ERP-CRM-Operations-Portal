import { prisma } from '../config/db.js';

export class ProductService {
  static async getProducts(params: { search?: string; categoryId?: string; warehouseId?: string; lowStock?: boolean; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.warehouseId) where.warehouseId = params.warehouseId;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
        { barcode: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [allProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          warehouse: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    let products = allProducts;
    if (params.lowStock) {
      products = products.filter((p) => p.stock <= p.minStock);
    }

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        warehouse: true,
        inventoryLogs: {
          include: {
            user: { select: { name: true } },
            warehouse: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
    });

    if (!product) throw new Error('Product not found');
    return product;
  }

  static async createProduct(data: any, userId: string) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) throw new Error(`Product with SKU '${data.sku}' already exists`);

    const product = await prisma.product.create({
      data,
      include: { category: true, warehouse: true },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          entity: 'Product Catalog',
          action: 'CREATED_PRODUCT',
          details: `Added new product SKU: ${product.sku} - ${product.name}`,
        },
      });
    }

    return product;
  }

  static async updateProduct(id: string, data: any, userId: string) {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, warehouse: true },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          entity: 'Product Catalog',
          action: 'UPDATED_PRODUCT',
          details: `Updated details for ${product.name} (Stock: ${product.stock})`,
        },
      });
    }

    return product;
  }

  static async deleteProduct(id: string) {
    try {
      return await prisma.product.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2003') {
        throw new Error('Cannot delete this product because it is being used in existing challans or inventory logs.');
      }
      throw err;
    }
  }

  static async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  static async getWarehouses() {
    return prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  static async addStockMovement(productId: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const quantity = parseInt(data.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) throw new Error('Invalid quantity');

      const type = data.type; // 'IN' or 'OUT'
      if (type !== 'IN' && type !== 'OUT') throw new Error('Invalid movement type');

      let newStock = product.stock;
      if (type === 'IN') {
        newStock += quantity;
      } else {
        if (product.stock < quantity) throw new Error('Insufficient stock');
        newStock -= quantity;
      }

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      const log = await tx.inventoryLog.create({
        data: {
          productId,
          warehouseId: product.warehouseId,
          userId,
          type,
          quantity,
          reason: data.reason || 'Manual Adjustment',
        },
      });

      return log;
    });
  }

  static async updateStockMovement(productId: string, movementId: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const existingLog = await tx.inventoryLog.findUnique({ where: { id: movementId } });
      if (!existingLog || existingLog.productId !== productId) throw new Error('Movement log not found');

      const newQuantity = parseInt(data.quantity, 10);
      if (isNaN(newQuantity) || newQuantity <= 0) throw new Error('Invalid quantity');

      const newType = data.type;
      if (newType !== 'IN' && newType !== 'OUT') throw new Error('Invalid movement type');

      // Revert old effect
      let intermediateStock = product.stock;
      if (existingLog.type === 'IN') {
        intermediateStock -= existingLog.quantity;
      } else {
        intermediateStock += existingLog.quantity;
      }

      // Apply new effect
      let finalStock = intermediateStock;
      if (newType === 'IN') {
        finalStock += newQuantity;
      } else {
        if (intermediateStock < newQuantity) throw new Error('Insufficient stock after recalculation');
        finalStock -= newQuantity;
      }

      await tx.product.update({
        where: { id: productId },
        data: { stock: finalStock },
      });

      const updatedLog = await tx.inventoryLog.update({
        where: { id: movementId },
        data: {
          type: newType,
          quantity: newQuantity,
          reason: data.reason || existingLog.reason,
          userId, // Log who modified it
        },
      });

      return updatedLog;
    });
  }
}
