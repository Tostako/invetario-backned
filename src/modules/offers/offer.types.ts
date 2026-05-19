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

const OfferBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.preprocess(emptyStringToUndefined, z.string().max(2000).optional()),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.coerce.number().min(0),
  scope: z.enum(['storewide', 'category', 'product']),
  product_id: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  category_id: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  code: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
    z.string().min(1).max(50).optional()
  ),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  is_active: z.preprocess(booleanFromForm, z.boolean().default(true)),
  usage_limit: z.coerce.number().int().min(0).optional(),
});

export const CreateOfferSchema = OfferBaseSchema.refine(
  (data) => data.ends_at > data.starts_at,
  { message: 'ends_at debe ser posterior a starts_at', path: ['ends_at'] }
).refine(
  (data) => {
    if (data.discount_type === 'percentage') return data.discount_value <= 100;
    return true;
  },
  { message: 'El porcentaje no puede superar 100', path: ['discount_value'] }
);

export const UpdateOfferSchema = OfferBaseSchema.partial().refine(
  (data) => {
    if (data.starts_at && data.ends_at) {
      return data.ends_at > data.starts_at;
    }
    return true;
  },
  { message: 'ends_at debe ser posterior a starts_at', path: ['ends_at'] }
).refine(
  (data) => {
    if (data.discount_type === 'percentage' && data.discount_value !== undefined) {
      return data.discount_value <= 100;
    }
    return true;
  },
  { message: 'El porcentaje no puede superar 100', path: ['discount_value'] }
);

export const OfferFilterSchema = z.object({
  is_active: z.preprocess(booleanFromForm, z.boolean().optional()),
  scope: z.enum(['storewide', 'category', 'product']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateOfferDto = z.infer<typeof CreateOfferSchema>;
export type UpdateOfferDto = z.infer<typeof UpdateOfferSchema>;
export type OfferFilter = z.infer<typeof OfferFilterSchema>;

export interface Offer {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  scope: 'storewide' | 'category' | 'product';
  product_id: string | null;
  category_id: string | null;
  code: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos del JOIN
  product_name?: string | null;
  category_name?: string | null;
}

export interface OfferWithStatus extends Offer {
  status: 'active' | 'expired' | 'scheduled' | 'disabled';
}

/** Oferta tal como se ve en el catálogo público (sin campos internos). */
export interface PublicOffer {
  id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  scope: 'storewide' | 'category' | 'product';
  product_id: string | null;
  category_id: string | null;
  code: string | null;
  starts_at: string;
  ends_at: string;
  product_name?: string | null;
  category_name?: string | null;
  product_image?: string | null;
  product_price?: number | null;
}
