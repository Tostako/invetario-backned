import { z } from 'zod';

export const UpdateShopSchema = z
  .object({
    name: z.string().min(1).max(150).optional(),
    phone: z.string().max(30).optional().nullable(),
    email: z.string().email().max(255).optional(),
    address: z.string().max(2000).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    currency: z.string().length(3).toUpperCase().optional(),
    timezone: z.string().min(1).max(60).optional(),
    vat_rate: z.coerce.number().min(0).max(100).optional(),
    min_order_amount: z.coerce.number().min(0).optional(),
    logo_url: z.string().url().max(2000).optional().nullable(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });

export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;

export interface TiendaPerfil {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
  vat_rate: number;
  min_order_amount: number;
  is_active: boolean;
  plan: string;
  created_at: string;
  updated_at: string;
}
