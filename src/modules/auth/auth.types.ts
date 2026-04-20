import { z } from 'zod';

export const RegisterShopSchema = z.object({
  shop_name: z.string().min(2).max(150),
  shop_slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  shop_email: z.string().email(),
  owner_name: z.string().min(2).max(100),
  owner_email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  shop_slug: z.string().min(1),  // identifica el tenant en el login
});

export const RegisterCustomerSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  phone: z.string().optional(),
  address: z.string().optional(),
  shop_slug: z.string().min(1), // Customer registra en una tienda específica
});

export const LoginCustomerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  shop_slug: z.string().min(1),
});

export type RegisterShopDto = z.infer<typeof RegisterShopSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterCustomerDto = z.infer<typeof RegisterCustomerSchema>;
export type LoginCustomerDto = z.infer<typeof LoginCustomerSchema>;
