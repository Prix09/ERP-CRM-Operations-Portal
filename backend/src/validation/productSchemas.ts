import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional().nullable(),
    price: z.number().positive('Price must be greater than 0'),
    costPrice: z.number().positive('Cost price must be greater than 0'),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
    minStock: z.number().int().nonnegative().default(10),
    unit: z.string().default('pcs'),
    barcode: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    categoryId: z.string().uuid('Invalid Category ID'),
    warehouseId: z.string().uuid('Invalid Warehouse ID'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3).optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    minStock: z.number().int().nonnegative().optional(),
    unit: z.string().optional(),
    barcode: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    categoryId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
  }),
});
