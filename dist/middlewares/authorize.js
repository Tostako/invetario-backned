"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../shared/errors/AppError");
// Jerarquía de roles: superadmin > owner > admin > staff > customer
const ROLE_HIERARCHY = {
    superadmin: 10,
    owner: 3,
    admin: 2,
    staff: 1,
    customer: 0,
};
// Fábrica de middleware: restringe la ruta a roles con nivel >= el requerido
// Uso: router.delete('/:id', authenticate, authorize('admin'), controller.delete)
const authorize = (...allowedRoles) => (req, _res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user.role];
    const minRequired = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r]));
    if (userLevel < minRequired) {
        throw new AppError_1.ForbiddenError('Insufficient permissions');
    }
    next();
};
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map