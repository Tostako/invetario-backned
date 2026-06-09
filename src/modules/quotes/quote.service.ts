// ─── Quotes Service ───────────────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas las cotizaciones de la tienda;
// Customer solo ve las suyas (filtrado por customer_id en el repository).
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllQuotes,
  findQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  asignarPlanACotizacion,
  registrarPagoManual,
  findPaymentsByQuote,
} from './quote.repository';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteFilter,
  Quote,
} from './quote.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';
import { Payment } from '../payments/payment.types';
import { dbObtenerPlanPago } from '../payment-plans/payment-plan.repository';

const ensureQuotePaymentPlanInData = (quote: Quote): Quote => {
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

const exposePaymentAliases = (payment: Payment): Payment => ({
  ...payment,
  installmentIndex: payment.plan_installment_index,
  transactionAmount: payment.transaction_amount,
  amount: payment.transaction_amount,
});

export const listQuotesService = async (
  shopId: string,
  filter: QuoteFilter,
  customerId?: string
): Promise<{ quotes: Quote[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllQuotes(shopId, filter, customerId);
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

export const getQuoteService = async (
  shopId: string,
  quoteId: string,
  customerId?: string
): Promise<Quote> => {
  const quote = await findQuoteById(shopId, quoteId);
  if (!quote) throw new NotFoundError('Cotización');

  // Si es customer, verificar que sea dueño
  if (customerId && quote.customer_id !== customerId) {
    throw new ForbiddenError('No puedes ver cotizaciones de otros clientes');
  }

  return ensureQuotePaymentPlanInData(quote);
};

export const createQuoteService = async (
  shopId: string,
  customerId: string,
  dto: CreateQuoteDto
): Promise<Quote> => {
  const quote = await createQuote(shopId, customerId, dto);
  return ensureQuotePaymentPlanInData(quote);
};

export const updateQuoteService = async (
  shopId: string,
  quoteId: string,
  dto: UpdateQuoteDto,
  customerId?: string
): Promise<Quote> => {
  // Verificar ownership si es customer
  if (customerId) {
    const existing = await findQuoteById(shopId, quoteId);
    if (!existing) throw new NotFoundError('Cotización');
    if (existing.customer_id !== customerId) {
      throw new ForbiddenError('No puedes editar cotizaciones de otros clientes');
    }
  }

  try {
    const updated = await updateQuote(shopId, quoteId, dto);
    if (!updated) throw new NotFoundError('Cotización');
    return ensureQuotePaymentPlanInData(updated);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
    });
  }
};

export const deleteQuoteService = async (
  shopId: string,
  quoteId: string,
  customerId?: string
): Promise<void> => {
  // Verificar ownership si es customer
  if (customerId) {
    const existing = await findQuoteById(shopId, quoteId);
    if (!existing) throw new NotFoundError('Cotización');
    if (existing.customer_id !== customerId) {
      throw new ForbiddenError('No puedes eliminar cotizaciones de otros clientes');
    }
  }

  try {
    await deleteQuote(shopId, quoteId);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
    });
  }
};

export const selectPlanForQuoteService = async (
  shopId: string,
  quoteId: string,
  planId: string | null,
  customerId?: string
): Promise<Quote> => {
  // Verificar existencia y pertenencia de la cotización
  const quote = await findQuoteById(shopId, quoteId);
  if (!quote) throw new NotFoundError('Cotización');
  if (customerId && quote.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para modificar esta cotización.');
  }

  // Si se asigna un plan, verificar existencia y pertenencia
  if (planId !== null) {
    const plan = await dbObtenerPlanPago(shopId, planId);
    if (!plan) throw new NotFoundError('Plan de pago');
    if (customerId && plan.customer_id !== customerId) {
      throw new ForbiddenError('No tienes permiso para usar este plan de pagos.');
    }
  }

  try {
    const updated = await asignarPlanACotizacion(shopId, quoteId, planId);
    return ensureQuotePaymentPlanInData(updated);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
      PLAN_NOT_FOUND: () => new NotFoundError('Plan de pago'),
    });
  }
};

export const registrarPagoManualService = async (
  shopId: string,
  quoteId: string,
  method: string,
  amount: number,
  installmentIdx: number | null,
  notes: string | null,
  userId: string | null,
  customerId?: string
): Promise<Payment> => {
  // Verificar cotización y pertenencia
  const quote = await findQuoteById(shopId, quoteId);
  if (!quote) throw new NotFoundError('Cotización');
  if (customerId && quote.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para registrar pagos en esta cotización.');
  }

  if (quote.payment_plan_id && (installmentIdx === null || installmentIdx === undefined)) {
    throw new ValidationError('Debes indicar installmentIndex para registrar un pago en un plan de pagos.');
  }

  // Si se pasa un indice de cuota, verificar que la cotizacion tenga plan de pagos y que el indice sea valido
  if (installmentIdx !== null && installmentIdx !== undefined) {
    if (!quote.payment_plan_id) {
      throw new ValidationError('La cotización no tiene un plan de pagos asignado.');
    }
    const plan = await dbObtenerPlanPago(shopId, quote.payment_plan_id);
    if (!plan) throw new NotFoundError('Plan de pago de la cotización');

    if (installmentIdx < 0 || installmentIdx >= plan.installments.length) {
      throw new ValidationError(`Índice de cuota inválido. El plan de pago tiene ${plan.installments.length} cuotas.`);
    }
  }

  try {
    const payment = await registrarPagoManual(shopId, quoteId, method, amount, installmentIdx ?? null, notes, userId);
    return exposePaymentAliases(payment);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
    });
  }
};

export const listQuotePaymentsService = async (
  shopId: string,
  quoteId: string,
  customerId?: string
): Promise<Payment[]> => {
  // Verificar cotización y pertenencia
  const quote = await findQuoteById(shopId, quoteId);
  if (!quote) throw new NotFoundError('Cotización');
  if (customerId && quote.customer_id !== customerId) {
    throw new ForbiddenError('No tienes permiso para ver los pagos de esta cotización.');
  }

  const payments = await findPaymentsByQuote(shopId, quoteId);
  return payments.map(exposePaymentAliases);
};
