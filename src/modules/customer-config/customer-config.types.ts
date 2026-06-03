import { z } from 'zod';

// ─── Esquemas de validación ───────────────────────────────────────────────────

const jsonOrObject = z.preprocess(
  (v) => {
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return v; }
    }
    return v;
  },
  z.record(z.unknown())
);

export const UpsertCustomerConfigSchema = z.object({
  services:         jsonOrObject.default({}),
  sub_packages:     jsonOrObject.default({}),
  complete_package: jsonOrObject.default({}),
  payment_plan:     jsonOrObject.default({}),
  invoice:          jsonOrObject.default({}),
  estimation:       jsonOrObject.default({}),
});

export const CustomerConfigFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type UpsertCustomerConfigDto = z.infer<typeof UpsertCustomerConfigSchema>;
export type CustomerConfigFilter = z.infer<typeof CustomerConfigFilterSchema>;

export interface CustomerConfig {
  id: string;
  shop_id: string;
  customer_id: string;
  services: Record<string, unknown>;
  sub_packages: Record<string, unknown>;
  complete_package: Record<string, unknown>;
  payment_plan: Record<string, unknown>;
  invoice: Record<string, unknown>;
  estimation: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
