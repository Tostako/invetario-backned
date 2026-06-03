// ─── Audit Log Repository ─────────────────────────────────────────────────────
// Thin adapter: solo lectura. La escritura se hace desde otros módulos.
// Funciones definidas en: database/35_fn_audit_logs.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { AuditLogFilter, AuditLog } from './audit-log.types';

interface FindAllResult {
  rows: AuditLog[];
  total: number;
}

export const findAllAuditLogs = async (
  shopId: string,
  filter: AuditLogFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<AuditLog & { total_count: string }>(
    `SELECT * FROM fn_listar_audit_logs($1, $2, $3, $4, $5)`,
    [
      shopId,
      filter.entity ?? null,
      filter.user_id ?? null,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findAuditLogById = async (
  shopId: string,
  logId: string
): Promise<AuditLog | null> => {
  const result = await query<AuditLog>(
    `SELECT * FROM fn_obtener_audit_log($1, $2)`,
    [shopId, logId]
  );
  return result.rows[0] ?? null;
};
