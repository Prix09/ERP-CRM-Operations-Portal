import { z } from 'zod';
import { CustomerType, CustomerStatus, NoteType } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    company: z.string().optional().nullable(),
    address: z.string().min(2, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    type: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
    status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    company: z.string().optional().nullable(),
    address: z.string().optional(),
    city: z.string().optional(),
    type: z.nativeEnum(CustomerType).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
  }),
});

export const addCustomerNoteSchema = z.object({
  body: z.object({
    note: z.string().min(2, 'Note text is required'),
    type: z.nativeEnum(NoteType).default(NoteType.NOTE),
    followUpDate: z.string().optional().nullable(),
  }),
});
