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

export const CreateSiteConfigSchema = z.object({
  section: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  value_type: z.enum(['text', 'markdown', 'image_url', 'color', 'json', 'boolean']).default('text'),
  active: z.preprocess(booleanFromForm, z.boolean().default(true)),
});

export const UpdateSiteConfigSchema = CreateSiteConfigSchema.partial().omit({ key: true, section: true });

export const SiteConfigFilterSchema = z.object({
  section: z.preprocess(emptyStringToUndefined, z.string().optional()),
  is_active: z.preprocess(booleanFromForm, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateSiteConfigDto = z.infer<typeof CreateSiteConfigSchema>;
export type UpdateSiteConfigDto = z.infer<typeof UpdateSiteConfigSchema>;
export type SiteConfigFilter = z.infer<typeof SiteConfigFilterSchema>;

export interface SiteConfig {
  id: string;
  shop_id: string;
  section: string;
  key: string;
  value: string;
  value_type: 'text' | 'markdown' | 'image_url' | 'color' | 'json' | 'boolean';
  active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Config tal como se ve en la landing pública (sin campos internos). */
export interface PublicSiteConfig {
  section: string;
  key: string;
  value: string;
  value_type: string;
}
