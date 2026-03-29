import { z } from 'zod';

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  sku: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9_\-]+$/, 'SKU only allows letters, numbers, hyphens and underscores'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  price: z.number().min(0),
  cost: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  stock_min: z.number().int().min(0).default(0),
  stock_max: z.number().int().min(1).optional(),
  unit: z.string().max(30).default('unit'),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductFilterSchema = z.object({
  search: z.string().optional(),           // busca en name y sku
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  low_stock: z.coerce.boolean().optional(), // solo productos con stock <= stock_min
  is_active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  supplier_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  cost: number | null;
  stock: number;
  stock_min: number;
  stock_max: number | null;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos del JOIN
  category_name?: string | null;
  supplier_name?: string | null;
}
