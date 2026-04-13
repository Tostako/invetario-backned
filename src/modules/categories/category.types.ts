import { z } from 'zod';

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  parent_id: z.string().uuid().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CategoryFilterSchema = z.object({
  is_active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;

export interface Category {
  id: string;
  shop_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
