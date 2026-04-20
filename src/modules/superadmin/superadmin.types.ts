import { z } from 'zod';

export const LoginSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterSuperAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(72),
  name: z.string().min(2).max(100),
});

export const CreateShopSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  address: z.string().optional(),
  logo_url: z.string().url().optional(),
  currency: z.string().length(3).default('USD'),
  timezone: z.string().max(60).default('UTC'),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).default('free'),
  owner_name: z.string().min(2).max(100),
  owner_email: z.string().email(),
  owner_password: z.string().min(8).max(72),
});

export const UpdateShopSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  address: z.string().optional(),
  logo_url: z.string().url().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().max(60).optional(),
  is_active: z.boolean().optional(),
  plan: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
});

export type LoginSuperAdminDto = z.infer<typeof LoginSuperAdminSchema>;
export type RegisterSuperAdminDto = z.infer<typeof RegisterSuperAdminSchema>;
export type CreateShopDto = z.infer<typeof CreateShopSchema>;
export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;
