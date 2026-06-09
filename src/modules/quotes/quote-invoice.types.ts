import { z } from 'zod';

const jsonOrObject = z.union([
  z.string().transform((val, ctx) => {
    try {
      return JSON.parse(val) as Record<string, unknown>;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JSON inválido' });
      return z.NEVER;
    }
  }),
  z.record(z.unknown()),
]);

export const InvoiceStatusSchema = z.enum(['pending', 'partial', 'paid']);

export const CreateQuoteInvoiceBodySchema = z.object({
  invoice: z.object({
    number: z.coerce.number().int().positive().optional(),
    client: z.string().min(1).max(255),
    project: z.string().min(1).max(255),
    description: z.string().min(1),
    total_amount: z.coerce.number().positive('total_amount debe ser mayor que cero'),
    form_data_snapshot: jsonOrObject,
    created_at: z.string().datetime().optional(),
  }),
});

export const UpdateQuoteInvoiceBodySchema = z.object({
  invoice: z.object({
    status: InvoiceStatusSchema.optional(),
    paid_at: z.string().datetime().nullable().optional(),
  }).refine(data => data.status !== undefined || data.paid_at !== undefined, {
    message: 'Debe enviar al menos status o paid_at',
  }),
});

export const QuoteInvoiceFilterSchema = z.object({
  status: InvoiceStatusSchema.optional(),
  sort: z.enum(['created_at:asc', 'created_at:desc']).default('created_at:desc'),
});

export type CreateQuoteInvoiceDto = z.infer<typeof CreateQuoteInvoiceBodySchema>['invoice'];
export type UpdateQuoteInvoiceDto = z.infer<typeof UpdateQuoteInvoiceBodySchema>['invoice'];
export type QuoteInvoiceFilter = z.infer<typeof QuoteInvoiceFilterSchema>;
export type QuoteInvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export interface QuoteInvoice {
  id: string;
  shop_id: string;
  quote_id: string;
  number: number;
  client: string;
  project: string;
  description: string;
  total_amount: number;
  status: QuoteInvoiceStatus;
  form_data_snapshot: Record<string, unknown>;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteInvoiceListItem extends Omit<QuoteInvoice, 'form_data_snapshot'> {}

export const toQuoteInvoiceListItem = (invoice: QuoteInvoice): QuoteInvoiceListItem => {
  const { form_data_snapshot: _snapshot, ...rest } = invoice;
  return rest;
};
