import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID'),
    notes: z.string().optional().nullable(),
    tax: z.number().nonnegative().default(0),
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid Product ID'),
        quantity: z.number().int().positive('Quantity must be greater than 0'),
      })
    ).min(1, 'At least one item is required'),
  }),
});

export const updateChallanStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ChallanStatus),
  }),
});
