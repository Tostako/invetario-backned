import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateQuoteSchema,
  UpdateQuoteSchema,
  QuoteFilterSchema,
} from './quote.types';
import {
  listQuotesService,
  getQuoteService,
  createQuoteService,
  updateQuoteService,
  deleteQuoteService,
  selectPlanForQuoteService,
  registrarPagoManualService,
  listQuotePaymentsService,
} from './quote.service';

// Helper: si el usuario es customer, devuelve su customer_id; si no, undefined (admin/owner ve todo)
const getCustomerId = (req: AuthenticatedRequest): string | undefined => {
  return req.user.role === 'customer' ? req.user.customer_id : undefined;
};

export const listQuotes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = QuoteFilterSchema.parse(req.query);
    const customerId = getCustomerId(req);
    const { quotes, meta } = await listQuotesService(req.user.shop_id, filter, customerId);
    sendSuccess(res, quotes, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const quote = await getQuoteService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
};

export const createQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Solo customers pueden crear cotizaciones
    const customerId = req.user.customer_id;
    if (!customerId) {
      res.status(403).json({ success: false, message: 'Only customers can create quotes' });
      return;
    }

    const dto = CreateQuoteSchema.parse(req.body);
    const quote = await createQuoteService(req.user.shop_id, customerId, dto);
    sendCreated(res, quote);
  } catch (err) {
    next(err);
  }
};

export const updateQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const dto = UpdateQuoteSchema.parse(req.body);
    const quote = await updateQuoteService(req.user.shop_id, req.params['id']!, dto, customerId);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
};

export const deleteQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    await deleteQuoteService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, { message: 'Quote deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/quotes/:id/select-plan
export const selectPlanForQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      payment_plan_id: z.string().uuid('El plan de pagos debe ser un UUID válido').nullable(),
    });
    const { payment_plan_id } = schema.parse(req.body);
    const customerId = getCustomerId(req);
    const quote = await selectPlanForQuoteService(req.user.shop_id, req.params['id']!, payment_plan_id, customerId);
    sendSuccess(res, quote);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/quotes/:id/payments
export const registerQuotePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      method: z.enum(['card', 'pse', 'manual', 'cash', 'transfer', 'wompi', 'other']),
      amount: z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
      transaction_amount: z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
      transactionAmount: z.coerce.number().positive('El monto debe ser mayor que cero').optional(),
      plan_installment_index: z.coerce.number().int().nonnegative().optional().nullable(),
      installmentIndex: z.coerce.number().int().nonnegative().optional().nullable(),
      notes: z.string().max(1000).optional().nullable(),
    }).refine(data => data.transaction_amount !== undefined || data.transactionAmount !== undefined || data.amount !== undefined, {
      message: "El monto del pago es requerido (campo 'amount', 'transactionAmount' o 'transaction_amount')",
      path: ['transaction_amount']
    });
    
    const dto = schema.parse(req.body);
    const resolvedAmount = dto.transaction_amount ?? dto.transactionAmount ?? dto.amount!;
    const resolvedInstallmentIndex = dto.plan_installment_index ?? dto.installmentIndex ?? null;
    
    const customerId = getCustomerId(req);
    const recordedBy = req.user.role !== 'customer' ? req.user.id : null;

    const payment = await registrarPagoManualService(
      req.user.shop_id,
      req.params['id']!,
      dto.method,
      resolvedAmount,
      resolvedInstallmentIndex,
      dto.notes ?? null,
      recordedBy,
      customerId
    );
    sendCreated(res, payment);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/quotes/:id/payments
export const listQuotePayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getCustomerId(req);
    const payments = await listQuotePaymentsService(req.user.shop_id, req.params['id']!, customerId);
    sendSuccess(res, payments);
  } catch (err) {
    next(err);
  }
};
