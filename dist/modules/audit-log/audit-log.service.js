"use strict";
// ─── Audit Log Service ───────────────────────────────────────────────────────
// Traduce errores de BD. Solo lectura para admin.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogService = exports.listAuditLogsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const audit_log_repository_1 = require("./audit-log.repository");
const listAuditLogsService = async (shopId, filter) => {
    const { rows, total } = await (0, audit_log_repository_1.findAllAuditLogs)(shopId, filter);
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
exports.listAuditLogsService = listAuditLogsService;
const getAuditLogService = async (shopId, logId) => {
    const log = await (0, audit_log_repository_1.findAuditLogById)(shopId, logId);
    if (!log)
        throw new AppError_1.NotFoundError('Log de auditoría');
    return log;
};
exports.getAuditLogService = getAuditLogService;
//# sourceMappingURL=audit-log.service.js.map