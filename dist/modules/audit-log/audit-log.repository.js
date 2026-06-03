"use strict";
// ─── Audit Log Repository ─────────────────────────────────────────────────────
// Thin adapter: solo lectura. La escritura se hace desde otros módulos.
// Funciones definidas en: database/35_fn_audit_logs.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAuditLogById = exports.findAllAuditLogs = void 0;
const database_1 = require("../../config/database");
const findAllAuditLogs = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_audit_logs($1, $2, $3, $4, $5)`, [
        shopId,
        filter.entity ?? null,
        filter.user_id ?? null,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllAuditLogs = findAllAuditLogs;
const findAuditLogById = async (shopId, logId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_audit_log($1, $2)`, [shopId, logId]);
    return result.rows[0] ?? null;
};
exports.findAuditLogById = findAuditLogById;
//# sourceMappingURL=audit-log.repository.js.map