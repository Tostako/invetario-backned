import { AuditLogFilter, AuditLog } from './audit-log.types';
interface FindAllResult {
    rows: AuditLog[];
    total: number;
}
export declare const findAllAuditLogs: (shopId: string, filter: AuditLogFilter) => Promise<FindAllResult>;
export declare const findAuditLogById: (shopId: string, logId: string) => Promise<AuditLog | null>;
export {};
//# sourceMappingURL=audit-log.repository.d.ts.map