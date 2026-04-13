import { z } from 'zod';

// ─── Tipos de documento de identificación válidos en Colombia ────────────────
export const TIPOS_IDENTIFICACION = ['CC', 'CE', 'NIT', 'PP', 'TI'] as const;

// ─── Esquema para pago con tarjeta (crédito / débito) ─────────────────────────
// Basado en el flujo oficial de Mercado Pago (Card Payments API)
export const PagoTarjetaSchema = z.object({
  order_id:          z.string().uuid(),
  token:             z.string().min(1),              // token generado por MP.js en el frontend
  description:       z.string().max(200).optional(),
  installments:      z.number().int().min(1).max(48).default(1),
  payment_method_id: z.string().min(1),              // ej: 'visa', 'master'
  issuer_id:         z.number().int().optional(),
  payer: z.object({
    email:           z.string().email(),
    identification: z.object({
      type:          z.enum(TIPOS_IDENTIFICACION),
      number:        z.string().min(4).max(20),
    }),
  }),
});

// ─── Esquema para pago por PSE ────────────────────────────────────────────────
export const PagoPseSchema = z.object({
  order_id:             z.string().uuid(),
  description:          z.string().max(200).optional(),
  financial_institution: z.string().min(1),          // código del banco
  callback_url:         z.string().url(),
  notification_url:     z.string().url().optional(),
  payer: z.object({
    email:          z.string().email(),
    first_name:     z.string().min(1).max(60),
    last_name:      z.string().min(1).max(60),
    entity_type:    z.enum(['individual', 'association']).default('individual'),
    identification: z.object({
      type:         z.enum(TIPOS_IDENTIFICACION),
      number:       z.string().min(4).max(20),
    }),
    address: z.object({
      zip_code:      z.string().max(10),
      street_name:   z.string().max(100),
      street_number: z.string().max(10),
      neighborhood:  z.string().max(60).optional(),
      city:          z.string().max(60),
      federal_unit:  z.string().max(30),
    }),
    phone: z.object({
      area_code: z.string().max(5),
      number:    z.string().max(15),
    }),
  }),
});

// ─── Esquema del webhook de Mercado Pago ──────────────────────────────────────
export const WebhookMpSchema = z.object({
  type:   z.string(),
  action: z.string().optional(),
  data: z.object({
    id: z.union([z.string(), z.number()]),
  }),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type PagoTarjetaDto = z.infer<typeof PagoTarjetaSchema>;
export type PagoPseDto     = z.infer<typeof PagoPseSchema>;
export type WebhookMpDto   = z.infer<typeof WebhookMpSchema>;

export interface Payment {
  id:                   string;
  shop_id:              string;
  order_id:             string;
  mp_payment_id:        number | null;
  method:               'card' | 'pse';
  status:               string;
  status_detail:        string | null;
  transaction_amount:   number;
  external_resource_url: string | null;
  raw_response:         unknown;
  created_at:           string;
  updated_at:           string;
}
