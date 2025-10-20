import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  barcode: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  scannedAt: z.string(),
  scannedCount: z.number().default(1),
  price: z.number().optional(),
  quantity: z.number().optional(),
  notes: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;