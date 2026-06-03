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

export const CreateLandingImageSchema = z.object({
  type: z.enum(['hero_bg', 'carousel', 'logo_main', 'logo_white', 'logo_abbreviated', 'about', 'service_card', 'cta_bg']),
  url: z.string().url(),
  alt: z.preprocess(emptyStringToUndefined, z.string().max(255).optional()),
  order: z.coerce.number().int().min(0).default(0),
  active: z.preprocess(booleanFromForm, z.boolean().default(true)),
  metadata: z.preprocess(
    (v) => {
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return v; }
      }
      return v;
    },
    z.record(z.unknown()).optional()
  ),
});

export const UpdateLandingImageSchema = CreateLandingImageSchema.partial();

export const LandingImageFilterSchema = z.object({
  type: z.enum(['hero_bg', 'carousel', 'logo_main', 'logo_white', 'logo_abbreviated', 'about', 'service_card', 'cta_bg']).optional(),
  is_active: z.preprocess(booleanFromForm, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateLandingImageDto = z.infer<typeof CreateLandingImageSchema>;
export type UpdateLandingImageDto = z.infer<typeof UpdateLandingImageSchema>;
export type LandingImageFilter = z.infer<typeof LandingImageFilterSchema>;

export interface LandingImage {
  id: string;
  shop_id: string;
  type: string;
  url: string;
  alt: string | null;
  order: number;
  active: boolean;
  metadata: Record<string, unknown> | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Imagen tal como se ve en la landing pública (sin campos internos). */
export interface PublicLandingImage {
  type: string;
  url: string;
  alt: string | null;
  order: number;
  metadata: Record<string, unknown> | null;
}
