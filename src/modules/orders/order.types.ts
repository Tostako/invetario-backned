import { z } from 'zod';

// ─── Estados válidos del pedido ───────────────────────────────────────────────

export const ESTADOS_PEDIDO = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type EstadoPedido = typeof ESTADOS_PEDIDO[number];

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CrearPedidoSchema = z.object({
  customer_id: z.string().uuid().optional(),
  notes:       z.string().max(500).optional(),
  // Los ítems vienen del carrito; opcionalmente se pueden pasar directo
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity:   z.number().int().min(1),
    discount:   z.number().min(0).default(0),
  })).min(1).optional(),
});

export const ActualizarEstadoSchema = z.object({
  status: z.enum(ESTADOS_PEDIDO),
  notes:  z.string().max(500).optional(),
});

export const FiltrosPedidoSchema = z.object({
  status:      z.enum(ESTADOS_PEDIDO).optional(),
  customer_id: z.string().uuid().optional(),
  desde:       z.string().datetime().optional(),
  hasta:       z.string().datetime().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CrearPedidoDto        = z.infer<typeof CrearPedidoSchema>;
export type ActualizarEstadoDto   = z.infer<typeof ActualizarEstadoSchema>;
export type FiltrosPedido         = z.infer<typeof FiltrosPedidoSchema>;

export interface OrderItem {
  id:         string;
  shop_id:    string;
  order_id:   string;
  product_id: string;
  quantity:   number;
  unit_price: number;
  discount:   number;
  subtotal:   number;
  created_at: string;
  // Enriquecido
  product_name?: string;
  product_sku?:  string;
}

export interface Order {
  id:            string;
  shop_id:       string;
  customer_id:   string | null;
  created_by:    string;
  order_number:  string;
  status:        EstadoPedido;
  subtotal:      number;
  discount:      number;
  tax:           number;
  total:         number;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
  // Enriquecido
  customer_name?: string | null;
  items?:         OrderItem[];
}
