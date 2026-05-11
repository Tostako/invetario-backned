import { z } from 'zod';

// Métodos de pago soportados
export const METODOS_PAGO = ['cash', 'card', 'transfer', 'pse', 'other'] as const;
export type MetodoPago = typeof METODOS_PAGO[number];

// ─── Esquema para registrar un pago ──────────────────────────────────────────
// El administrador o empleado confirma el pago que recibió (efectivo, tarjeta,
// transferencia, etc.). El monto lo calcula el backend desde la orden.
export const RegistrarPagoSchema = z.object({
  order_id:    z.string().uuid(),
  method:      z.enum(METODOS_PAGO),
  notes:       z.string().max(500).optional(),
});

// ─── Esquema para actualizar estado de un pago ───────────────────────────────
export const ActualizarPagoSchema = z.object({
  status:  z.enum(['approved', 'rejected', 'cancelled', 'refunded']),
  notes:   z.string().max(500).optional(),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────
export type RegistrarPagoDto    = z.infer<typeof RegistrarPagoSchema>;
export type ActualizarPagoDto   = z.infer<typeof ActualizarPagoSchema>;

export interface Payment {
  id:                    string;
  shop_id:               string;
  order_id:              string;
  mp_payment_id:         number | null;
  method:                string;
  status:                string;
  status_detail:         string | null;
  transaction_amount:    number;
  external_resource_url: string | null;
  raw_response:          unknown;
  created_at:            string;
  updated_at:            string;
}
