"use strict";
// ─── Quotes Repository ────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/37_fn_quotes.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuote = exports.updateQuote = exports.createQuote = exports.findQuoteById = exports.findAllQuotes = void 0;
const database_1 = require("../../config/database");
const findAllQuotes = async (shopId, filter, customerId) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_cotizaciones($1, $2, $3, $4, $5)`, [
        shopId,
        customerId ?? null,
        filter.status ?? null,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllQuotes = findAllQuotes;
const findQuoteById = async (shopId, quoteId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_cotizacion($1, $2)`, [shopId, quoteId]);
    return result.rows[0] ?? null;
};
exports.findQuoteById = findQuoteById;
const createQuote = async (shopId, customerId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_cotizacion($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
        shopId,
        customerId,
        dto.client,
        dto.project,
        dto.area,
        dto.price,
        dto.status,
        JSON.stringify(dto.data),
        dto.date ?? null,
    ]);
    return result.rows[0];
};
exports.createQuote = createQuote;
const updateQuote = async (shopId, quoteId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_cotizacion($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
        shopId,
        quoteId,
        null, // customer_id no se cambia
        dto.client ?? null,
        dto.project ?? null,
        dto.area ?? null,
        dto.price ?? null,
        dto.status ?? null,
        dto.data ? JSON.stringify(dto.data) : null,
        dto.date ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.updateQuote = updateQuote;
const deleteQuote = async (shopId, quoteId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_cotizacion($1, $2)`, [shopId, quoteId]);
    return true;
};
exports.deleteQuote = deleteQuote;
//# sourceMappingURL=quote.repository.js.map