import { z } from 'zod';

export const UpdateProfileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional().nullable(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos un campo para actualizar' });

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(72),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const NotificationPreferencesSchema = z
  .object({
    email_orders: z.boolean().optional(),
    email_low_stock: z.boolean().optional(),
    email_marketing: z.boolean().optional(),
    push_enabled: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Debe enviar al menos una preferencia' });

export type NotificationPreferencesPatch = z.infer<typeof NotificationPreferencesSchema>;

export const Enable2faSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos'),
});

export const Disable2faSchema = z.object({
  password: z.string().min(1),
});

export const PREFERENCIAS_DEFECTO = {
  email_orders: true,
  email_low_stock: true,
  email_marketing: false,
  push_enabled: false,
} as const;

export type PreferenciasNotificacion = {
  email_orders: boolean;
  email_low_stock: boolean;
  email_marketing: boolean;
  push_enabled: boolean;
};

export interface PerfilUsuario {
  id: string;
  shop_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}
