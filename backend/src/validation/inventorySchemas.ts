import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createInventoryMovementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    warehouseId: z.string().uuid('Invalid Warehouse ID'),
    type: z.nativeEnum(MovementType),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    reason: z.string().min(3, 'Reason is required'),
    referenceNo: z.string().optional().nullable(),
  }),
});
