import { z } from 'zod';

const tiposMovimiento = ['purchase', 'sale', 'adjustment', 'return', 'loss'] as const;

export const MovimientosFilterSchema = z.object({
  product_id: z.string().uuid().optional(),
  type: z.enum(tiposMovimiento).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MovimientosFilter = z.infer<typeof MovimientosFilterSchema>;

export interface MovimientoInventario {
  id: string;
  shop_id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  notes: string | null;
  created_at: string;
  product_name: string;
  product_sku: string;
}

export interface AlertaInventario {
  product_id: string;
  sku: string;
  name: string;
  stock: number;
  stock_min: number;
  stock_max: number | null;
  image_url: string | null;
  is_active: boolean;
  tipo_alerta: 'sin_stock' | 'stock_bajo';
}
