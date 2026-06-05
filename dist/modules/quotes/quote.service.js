"use strict";
// ─── Quotes Service ───────────────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas las cotizaciones de la tienda;
// Customer solo ve las suyas (filtrado por customer_id en el repository).
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuotePaymentsService = exports.registrarPagoManualService = exports.selectPlanForQuoteService = exports.deleteQuoteService = exports.updateQuoteService = exports.createQuoteService = exports.getQuoteService = exports.listQuotesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const quote_repository_1 = require("./quote.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const payment_plan_repository_1 = require("../payment-plans/payment-plan.repository");
const ensureQuotePaymentPlanInData = (quote) => {
    const data = quote.data ?? {};
    const paymentPlanId = quote.payment_plan_id ?? data['paymentPlanId'] ?? null;
    return {
        ...quote,
        data: paymentPlanId === null
            ? data
            : {
                ...data,
                paymentPlanId,
            },
    };
};
const exposePaymentAliases = (payment) => ({
    ...payment,
    installmentIndex: payment.plan_installment_index,
    transactionAmount: payment.transaction_amount,
    amount: payment.transaction_amount,
});
const listQuotesService = async (shopId, filter, customerId) => {
    const { rows, total } = await (0, quote_repository_1.findAllQuotes)(shopId, filter, customerId);
    return {
        quotes: rows.map(ensureQuotePaymentPlanInData),
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
    return ensureQuotePaymentPlanInData(quote);
};
exports.getQuoteService = getQuoteService;
const createQuoteService = async (shopId, customerId, dto) => {
    const quote = await (0, quote_repository_1.createQuote)(shopId, customerId, dto);
    return ensureQuotePaymentPlanInData(quote);
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
        return ensureQuotePaymentPlanInData(updated);
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
const selectPlanForQuoteService = async (shopId, quoteId, planId, customerId) => {
    // Verificar existencia y pertenencia de la cotización
    const quote = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
    if (!quote)
        throw new AppError_1.NotFoundError('Cotización');
    if (customerId && quote.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No tienes permiso para modificar esta cotización.');
    }
    // Si se asigna un plan, verificar existencia y pertenencia
    if (planId !== null) {
        const plan = await (0, payment_plan_repository_1.dbObtenerPlanPago)(shopId, planId);
        if (!plan)
            throw new AppError_1.NotFoundError('Plan de pago');
        if (customerId && plan.customer_id !== customerId) {
            throw new AppError_1.ForbiddenError('No tienes permiso para usar este plan de pagos.');
        }
    }
    try {
        const updated = await (0, quote_repository_1.asignarPlanACotizacion)(shopId, quoteId, planId);
        return ensureQuotePaymentPlanInData(updated);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            QUOTE_NOT_FOUND: () => new AppError_1.NotFoundError('Cotización'),
            PLAN_NOT_FOUND: () => new AppError_1.NotFoundError('Plan de pago'),
        });
    }
};
exports.selectPlanForQuoteService = selectPlanForQuoteService;
const registrarPagoManualService = async (shopId, quoteId, method, amount, installmentIdx, notes, userId, customerId) => {
    // Verificar cotización y pertenencia
    const quote = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
    if (!quote)
        throw new AppError_1.NotFoundError('Cotización');
    if (customerId && quote.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No tienes permiso para registrar pagos en esta cotización.');
    }
    if (quote.payment_plan_id && (installmentIdx === null || installmentIdx === undefined)) {
        throw new AppError_1.ValidationError('Debes indicar installmentIndex para registrar un pago en un plan de pagos.');
    }
    // Si se pasa un indice de cuota, verificar que la cotizacion tenga plan de pagos y que el indice sea valido
    if (installmentIdx !== null && installmentIdx !== undefined) {
        if (!quote.payment_plan_id) {
            throw new AppError_1.ValidationError('La cotización no tiene un plan de pagos asignado.');
        }
        const plan = await (0, payment_plan_repository_1.dbObtenerPlanPago)(shopId, quote.payment_plan_id);
        if (!plan)
            throw new AppError_1.NotFoundError('Plan de pago de la cotización');
        if (installmentIdx < 0 || installmentIdx >= plan.installments.length) {
            throw new AppError_1.ValidationError(`Índice de cuota inválido. El plan de pago tiene ${plan.installments.length} cuotas.`);
        }
    }
    try {
        const payment = await (0, quote_repository_1.registrarPagoManual)(shopId, quoteId, method, amount, installmentIdx ?? null, notes, userId);
        return exposePaymentAliases(payment);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            QUOTE_NOT_FOUND: () => new AppError_1.NotFoundError('Cotización'),
        });
    }
};
exports.registrarPagoManualService = registrarPagoManualService;
const listQuotePaymentsService = async (shopId, quoteId, customerId) => {
    // Verificar cotización y pertenencia
    const quote = await (0, quote_repository_1.findQuoteById)(shopId, quoteId);
    if (!quote)
        throw new AppError_1.NotFoundError('Cotización');
    if (customerId && quote.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No tienes permiso para ver los pagos de esta cotización.');
    }
    const payments = await (0, quote_repository_1.findPaymentsByQuote)(shopId, quoteId);
    return payments.map(exposePaymentAliases);
};
exports.listQuotePaymentsService = listQuotePaymentsService;
//# sourceMappingURL=quote.service.js.map