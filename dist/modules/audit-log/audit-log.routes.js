"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const audit_log_controller_1 = require("./audit-log.controller");
const router = (0, express_1.Router)();
exports.auditLogRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// Solo admin/owner puede ver auditoría
router.get('/', (0, authorize_1.authorize)('admin', 'owner'), audit_log_controller_1.listAuditLogs);
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), audit_log_controller_1.getAuditLog);
//# sourceMappingURL=audit-log.routes.js.map