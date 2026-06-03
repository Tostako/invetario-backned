"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantGuard = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../shared/errors/AppError");
const uuidV4_1 = require("../shared/utils/uuidV4");
// Verifica que la tienda del token sigue existiendo y está activa.
// Se ejecuta DESPUÉS de authenticate. Protege contra:
//   - Tiendas desactivadas por impago o suspensión
//   - Tokens válidos de tenants eliminados
//
// Para evitar una query a DB en cada request se puede añadir caché
// (p. ej. node-cache con TTL de 60s) cuando la escala lo justifique.
const tenantGuard = async (req, _res, next) => {
    try {
        const shopId = req.user?.shop_id;
        if (!shopId || !(0, uuidV4_1.esUuidV4)(shopId)) {
            throw new AppError_1.ForbiddenError('Invalid or missing shop identifier');
        }
        const result = await (0, database_1.query)('SELECT is_active FROM shops WHERE id = $1', [shopId]);
        const shop = result.rows[0];
        if (!shop) {
            throw new AppError_1.ForbiddenError('Shop not found');
        }
        if (!shop.is_active) {
            throw new AppError_1.ForbiddenError('Shop is suspended');
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.tenantGuard = tenantGuard;
//# sourceMappingURL=tenantGuard.js.map