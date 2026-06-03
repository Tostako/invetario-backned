// ─── Audit Log Service ───────────────────────────────────────────────────────
// Traduce errores de BD. Solo lectura para admin.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllAuditLogs,
  findAuditLogById,
} from './audit-log.repository';
import {
  AuditLogFilter,
  AuditLog,
} from './audit-log.types';

export const listAuditLogsService = async (
  shopId: string,
  filter: AuditLogFilter
): Promise<{ logs: AuditLog[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllAuditLogs(shopId, filter);
  return {
    logs: rows,
    meta: {
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getAuditLogService = async (
  shopId: string,
  logId: string
): Promise<AuditLog> => {
  const log = await findAuditLogById(shopId, logId);
  if (!log) throw new NotFoundError('Log de auditoría');
  return log;
};
