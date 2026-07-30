import { prisma } from '../config/db.js';

export class ProductService {
  static async getProducts(params: { search?: string; categoryId?: string; warehouseId?: string; lowStock?: boolean; page?: number; limit?: number }): Promise<any> {
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

    // Auto-seed default product for fresh deployments
    if (total === 0 && Object.keys(where).length === 0) {
      const categories = await this.getCategories();
      const warehouses = await this.getWarehouses();
      if (categories.length > 0 && warehouses.length > 0) {
        try {
          await prisma.product.create({
            data: {
              sku: 'PRD-DEMO-001',
              name: 'Demo Product',
              description: 'Auto-generated demo product for testing',
              price: 299.99,
              costPrice: 150.00,
              stock: 500,
              minStock: 50,
              unit: 'pcs',
              categoryId: categories[0].id,
              warehouseId: warehouses[0].id,
            }
          });
          // Refetch to include the newly seeded product
          return this.getProducts(params);
        } catch (e) {
          // Ignore unique constraint errors in case of race conditions
        }
      }
    }

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
    let categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: [
          { name: 'Electronics', description: 'Electronic items and gadgets' },
          { name: 'Apparel', description: 'Clothing and accessories' },
          { name: 'Home & Kitchen', description: 'Home appliances and kitchenware' },
        ],
        skipDuplicates: true,
      });
      categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    }
    return categories;
  }

  static async getWarehouses() {
    let warehouses = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
    if (warehouses.length === 0) {
      await prisma.warehouse.createMany({
        data: [
          { name: 'Main Hub', code: 'WH-MAIN-01', location: 'New York, NY' },
          { name: 'West Coast Transit', code: 'WH-WEST-02', location: 'Los Angeles, CA' },
        ],
        skipDuplicates: true,
      });
      warehouses = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
    }
    return warehouses;
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
