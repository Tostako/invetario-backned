import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

// ─── Esquemas de validación ───────────────────────────────────────────────────

export const AuditLogFilterSchema = z.object({
  entity: z.preprocess(emptyStringToUndefined, z.string().optional()),
  user_id: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── Tipos TypeScript ─────────────────────────────────────────────────────────

export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;

export interface AuditLog {
  id: string;
  shop_id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  old_value: string | null;
  new_value: string | null;
  user_id: string;
  created_at: string;
}
