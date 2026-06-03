import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const CreateQuoteSchema = z.object({
  client: z.string().min(1).max(255),
  project: z.string().min(1).max(255),
  area: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  status: z.enum(['draft', 'sent', 'paid', 'completed']).default('draft'),
  data: z.preprocess(
    (v) => {
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { return v; }
      }
      return v;
    },
    z.record(z.unknown()).default({})
  ),
  date: z.coerce.date().optional(),
});

export const UpdateQuoteSchema = CreateQuoteSchema.partial();

export const QuoteFilterSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'completed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type CreateQuoteDto = z.infer<typeof CreateQuoteSchema>;
export type UpdateQuoteDto = z.infer<typeof UpdateQuoteSchema>;
export type QuoteFilter = z.infer<typeof QuoteFilterSchema>;

export interface Quote {
  id: string;
  shop_id: string;
  customer_id: string;
  client: string;
  project: string;
  area: number;
  price: number;
  status: 'draft' | 'sent' | 'paid' | 'completed';
  data: Record<string, unknown>;
  date: string;
  created_at: string;
  updated_at: string;
}
