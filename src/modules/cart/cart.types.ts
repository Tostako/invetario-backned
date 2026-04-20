import { z } from 'zod';

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const AgregarItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity:   z.number().int().min(1),
});

export const ActualizarItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type AgregarItemDto    = z.infer<typeof AgregarItemSchema>;
export type ActualizarItemDto = z.infer<typeof ActualizarItemSchema>;

export interface CartItem {
  id:          string;
  shop_id:     string;
  customer_id: string;
  product_id:  string;
  quantity:    number;
  created_at:  string;
  updated_at:  string;
  // Campos enriquecidos del JOIN con products
  product_name?:  string;
  product_sku?:   string;
  unit_price?:    number;
  subtotal?:      number;
  stock_available?: number;
}

export interface CartResumen {
  items:   CartItem[];
  total:   number;
}
