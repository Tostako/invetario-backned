import { Response, NextFunction } from 'express';
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
