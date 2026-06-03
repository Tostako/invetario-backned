import { PaginationMeta } from '../../shared/types';
import { AuditLogFilter, AuditLog } from './audit-log.types';
export declare const listAuditLogsService: (shopId: string, filter: AuditLogFilter) => Promise<{
    logs: AuditLog[];
    meta: PaginationMeta;
}>;
export declare const getAuditLogService: (shopId: string, logId: string) => Promise<AuditLog>;
//# sourceMappingURL=audit-log.service.d.ts.map