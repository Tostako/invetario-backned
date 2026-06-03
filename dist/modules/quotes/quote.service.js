"use strict";
// ─── Quotes Service ───────────────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas las cotizaciones de la tienda;
// Customer solo ve las suyas (filtrado por customer_id en el repository).
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuoteService = exports.updateQuoteService = exports.createQuoteService = exports.getQuoteService = exports.listQuotesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const quote_repository_1 = require("./quote.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const listQuotesService = async (shopId, filter, customerId) => {
    const { rows, total } = await (0, quote_repository_1.findAllQuotes)(shopId, filter, customerId);
    return {
        quotes: rows,
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listQuotesService = listQuotesService;
const getQuoteService = async (shopId, quoteId, customerId) => {
    const quote = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
    if (!quote)
        throw new AppError_1.NotFoundError('Cotización');
    // Si es customer, verificar que sea dueño
    if (customerId && quote.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No puedes ver cotizaciones de otros clientes');
    }
    return quote;
};
exports.getQuoteService = getQuoteService;
const createQuoteService = async (shopId, customerId, dto) => {
    return await (0, quote_repository_1.createQuote)(shopId, customerId, dto);
};
exports.createQuoteService = createQuoteService;
const updateQuoteService = async (shopId, quoteId, dto, customerId) => {
    // Verificar ownership si es customer
    if (customerId) {
        const existing = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
        if (!existing)
            throw new AppError_1.NotFoundError('Cotización');
        if (existing.customer_id !== customerId) {
            throw new AppError_1.ForbiddenError('No puedes editar cotizaciones de otros clientes');
        }
    }
    try {
        const updated = await (0, quote_repository_1.updateQuote)(shopId, quoteId, dto);
        if (!updated)
            throw new AppError_1.NotFoundError('Cotización');
        return updated;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            QUOTE_NOT_FOUND: () => new AppError_1.NotFoundError('Cotización'),
        });
    }
};
exports.updateQuoteService = updateQuoteService;
const deleteQuoteService = async (shopId, quoteId, customerId) => {
    // Verificar ownership si es customer
    if (customerId) {
        const existing = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
        if (!existing)
            throw new AppError_1.NotFoundError('Cotización');
        if (existing.customer_id !== customerId) {
            throw new AppError_1.ForbiddenError('No puedes eliminar cotizaciones de otros clientes');
        }
    }
    try {
        await (0, quote_repository_1.deleteQuote)(shopId, quoteId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            QUOTE_NOT_FOUND: () => new AppError_1.NotFoundError('Cotización'),
        });
    }
};
exports.deleteQuoteService = deleteQuoteService;
//# sourceMappingURL=quote.service.js.map