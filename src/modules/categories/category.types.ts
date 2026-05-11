import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const booleanFromForm = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return undefined;
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return value;
};

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.preprocess(emptyStringToUndefined, z.string().max(500).optional()),
  is_active: z.preprocess(booleanFromForm, z.boolean().default(true)),
  parent_id: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CategoryFilterSchema = z.object({
  is_active: z.preprocess(booleanFromForm, z.boolean().optional()),
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
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
