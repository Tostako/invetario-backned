import { z } from 'zod';

export const ListCustomersQuerySchema = z.object({
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListCustomersQuery = z.infer<typeof ListCustomersQuerySchema>;

export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;

export interface PedidoClienteResumen {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CustomerDetailQuerySchema = z.object({
  /** Query: ?include_orders=true */
  include_orders: z
    .string()
    .optional()
    .transform((s) => s === 'true'),
});

export type CustomerDetailQuery = z.infer<typeof CustomerDetailQuerySchema>;
