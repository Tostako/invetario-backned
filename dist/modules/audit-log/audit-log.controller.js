"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLog = exports.listAuditLogs = void 0;
const response_1 = require("../../shared/utils/response");
const audit_log_types_1 = require("./audit-log.types");
const audit_log_service_1 = require("./audit-log.service");
const listAuditLogs = async (req, res, next) => {
    try {
        const filter = audit_log_types_1.AuditLogFilterSchema.parse(req.query);
        const { logs, meta } = await (0, audit_log_service_1.listAuditLogsService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, logs, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listAuditLogs = listAuditLogs;
const getAuditLog = async (req, res, next) => {
    try {
        const log = await (0, audit_log_service_1.getAuditLogService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, log);
    }
    catch (err) {
        next(err);
    }
};
exports.getAuditLog = getAuditLog;
//# sourceMappingURL=audit-log.controller.js.map