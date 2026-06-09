"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuotePayments = exports.registerQuotePayment = exports.selectPlanForQuote = exports.deleteQuote = exports.updateQuote = exports.createQuote = exports.getQuote = exports.listQuotes = void 0;
const zod_1 = require("zod");
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
// POST /api/v1/quotes/:id/select-plan
const selectPlanForQuote = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            payment_plan_id: zod_1.z.string().uuid('El plan de pagos debe ser un UUID válido').nullable(),
        });
        const { payment_plan_id } = schema.parse(req.body);
        const customerId = getCustomerId(req);
        const quote = await (0, quote_service_1.selectPlanForQuoteService)(req.user.shop_id, req.params['id'], payment_plan_id, customerId);
        (0, response_1.sendSuccess)(res, quote);
    }
    catch (err) {
        next(err);
    }
};
exports.selectPlanForQuote = selectPlanForQuote;
// POST /api/v1/quotes/:id/payments
const registerQuotePayment = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            method: zod_1.z.enum(['card', 'pse', 'manual', 'cash', 'transfer', 'wompi', 'other']),
            amount: zod_1.z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
            transaction_amount: zod_1.z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
            transactionAmount: zod_1.z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
            plan_installment_index: zod_1.z.coerce.number().int().nonnegative().optional().nullable(),
            installmentIndex: zod_1.z.coerce.number().int().nonnegative().optional().nullable(),
            notes: zod_1.z.string().max(1000).optional().nullable(),
        }).refine(data => data.transaction_amount !== undefined || data.transactionAmount !== undefined || data.amount !== undefined, {
            message: "El monto del pago es requerido (campo 'amount', 'transactionAmount' o 'transaction_amount')",
            path: ['transaction_amount']
        });
        const dto = schema.parse(req.body);
        const resolvedAmount = dto.transaction_amount ?? dto.transactionAmount ?? dto.amount;
        const resolvedInstallmentIndex = dto.plan_installment_index ?? dto.installmentIndex ?? null;
        const customerId = getCustomerId(req);
        const recordedBy = req.user.role !== 'customer' ? req.user.id : null;
        const payment = await (0, quote_service_1.registrarPagoManualService)(req.user.shop_id, req.params['id'], dto.method, resolvedAmount, resolvedInstallmentIndex, dto.notes ?? null, recordedBy, customerId);
        (0, response_1.sendCreated)(res, payment);
    }
    catch (err) {
        next(err);
    }
};
exports.registerQuotePayment = registerQuotePayment;
// GET /api/v1/quotes/:id/payments
const listQuotePayments = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const payments = await (0, quote_service_1.listQuotePaymentsService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, payments);
    }
    catch (err) {
        next(err);
    }
};
exports.listQuotePayments = listQuotePayments;
//# sourceMappingURL=quote.controller.js.map