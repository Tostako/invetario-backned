"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuote = exports.updateQuote = exports.createQuote = exports.getQuote = exports.listQuotes = void 0;
const response_1 = require("../../shared/utils/response");
const quote_types_1 = require("./quote.types");
const quote_service_1 = require("./quote.service");
// Helper: si el usuario es customer, devuelve su customer_id; si no, undefined (admin/owner ve todo)
const getCustomerId = (req) => {
    return req.user.role === 'customer' ? req.user.customer_id : undefined;
};
const listQuotes = async (req, res, next) => {
    try {
        const filter = quote_types_1.QuoteFilterSchema.parse(req.query);
        const customerId = getCustomerId(req);
        const { quotes, meta } = await (0, quote_service_1.listQuotesService)(req.user.shop_id, filter, customerId);
        (0, response_1.sendSuccess)(res, quotes, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listQuotes = listQuotes;
const getQuote = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const quote = await (0, quote_service_1.getQuoteService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, quote);
    }
    catch (err) {
        next(err);
    }
};
exports.getQuote = getQuote;
const createQuote = async (req, res, next) => {
    try {
        // Solo customers pueden crear cotizaciones
        const customerId = req.user.customer_id;
        if (!customerId) {
            res.status(403).json({ success: false, message: 'Only customers can create quotes' });
            return;
        }
        const dto = quote_types_1.CreateQuoteSchema.parse(req.body);
        const quote = await (0, quote_service_1.createQuoteService)(req.user.shop_id, customerId, dto);
        (0, response_1.sendCreated)(res, quote);
    }
    catch (err) {
        next(err);
    }
};
exports.createQuote = createQuote;
const updateQuote = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const dto = quote_types_1.UpdateQuoteSchema.parse(req.body);
        const quote = await (0, quote_service_1.updateQuoteService)(req.user.shop_id, req.params['id'], dto, customerId);
        (0, response_1.sendSuccess)(res, quote);
    }
    catch (err) {
        next(err);
    }
};
exports.updateQuote = updateQuote;
const deleteQuote = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        await (0, quote_service_1.deleteQuoteService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, { message: 'Quote deleted successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteQuote = deleteQuote;
//# sourceMappingURL=quote.controller.js.map