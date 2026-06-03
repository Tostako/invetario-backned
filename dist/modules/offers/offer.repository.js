"use strict";
// ─── Offers Repository ───────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/29_fn_offers.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPublicOffers = exports.softDeleteOffer = exports.updateOffer = exports.createOffer = exports.findOfferById = exports.findAllOffers = void 0;
const database_1 = require("../../config/database");
const findAllOffers = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_ofertas($1, $2, $3, $4, $5)`, [
        shopId,
        filter.is_active ?? null,
        filter.scope ?? null,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllOffers = findAllOffers;
const findOfferById = async (shopId, offerId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_oferta($1, $2)`, [shopId, offerId]);
    return result.rows[0] ?? null;
};
exports.findOfferById = findOfferById;
const createOffer = async (shopId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_oferta($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, [
        shopId,
        dto.title,
        dto.discount_type,
        dto.discount_value,
        dto.scope,
        dto.starts_at,
        dto.ends_at,
        dto.description ?? null,
        dto.product_id ?? null,
        dto.category_id ?? null,
        dto.code ?? null,
        dto.is_active,
        dto.usage_limit ?? null,
    ]);
    return result.rows[0];
};
exports.createOffer = createOffer;
const updateOffer = async (shopId, offerId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_oferta($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [
        shopId,
        offerId,
        dto.title ?? null,
        dto.description ?? null,
        dto.discount_type ?? null,
        dto.discount_value ?? null,
        dto.scope ?? null,
        dto.product_id ?? null,
        dto.category_id ?? null,
        dto.code ?? null,
        dto.starts_at ?? null,
        dto.ends_at ?? null,
        dto.is_active ?? null,
        dto.usage_limit ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.updateOffer = updateOffer;
const softDeleteOffer = async (shopId, offerId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_oferta($1, $2)`, [shopId, offerId]);
    return true;
};
exports.softDeleteOffer = softDeleteOffer;
const findPublicOffers = async (shopId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_ofertas_publicas($1)`, [shopId]);
    return result.rows;
};
exports.findPublicOffers = findPublicOffers;
//# sourceMappingURL=offer.repository.js.map