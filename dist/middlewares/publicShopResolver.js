"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicShopResolver = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../shared/errors/AppError");
/**
 * Middleware para endpoints públicos (sin autenticación).
 * Resuelve shop_id a partir de shop_slug en query params.
 * Simula un req.user mínimo para que los controllers/services existentes funcionen.
 *
 * Uso: app.get('/api/v1/public/...', publicShopResolver, controller)
 */
const publicShopResolver = async (req, _res, next) => {
    try {
        const shopSlug = req.query['shop_slug'];
        if (!shopSlug || typeof shopSlug !== 'string') {
            throw new AppError_1.BadRequestError('Query param "shop_slug" is required');
        }
        const result = await (0, database_1.query)('SELECT id, is_active FROM shops WHERE slug = $1', [shopSlug.toLowerCase()]);
        const shop = result.rows[0];
        if (!shop) {
            throw new AppError_1.NotFoundError('Shop');
        }
        if (!shop.is_active) {
            throw new AppError_1.BadRequestError('Shop is suspended');
        }
        // Simular un req.user mínimo para reutilizar services/controllers
        req.user = {
            id: 'public',
            shop_id: shop.id,
            email: 'public@visitor.com',
            role: 'staff', // rol neutro que puede leer
        };
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.publicShopResolver = publicShopResolver;
//# sourceMappingURL=publicShopResolver.js.map