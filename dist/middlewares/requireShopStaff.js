"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireShopStaff = void 0;
const AppError_1 = require("../shared/errors/AppError");
/** Solo empleados de tienda (owner, admin, staff). Excluye customer y superadmin. */
const requireShopStaff = (req, _res, next) => {
    const r = req.user.role;
    if (r === 'customer' || r === 'superadmin') {
        throw new AppError_1.ForbiddenError('Este recurso solo está disponible para usuarios de la tienda');
    }
    next();
};
exports.requireShopStaff = requireShopStaff;
//# sourceMappingURL=requireShopStaff.js.map