import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateQuoteInvoiceBodySchema,
  UpdateQuoteInvoiceBodySchema,
  QuoteInvoiceFilterSchema,
} from './quote-invoice.types';
import {
  listQuoteInvoicesService,
  getQuoteInvoiceService,
  createQuoteInvoiceService,
  updateQuoteInvoiceService,
  deleteQuoteInvoiceService,
} from './quote-invoice.service';

const getCustomerId = (req: AuthenticatedRequest): string | undefined => {
  return req.user.role === 'customer' ? req.user.customer_id : undefined;
};

const getQuoteCustomerScope = (req: AuthenticatedRequest): string | undefined => {
  return getCustomerId(req) ?? req.user.customer_id;
};

export const listQuoteInvoices = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = QuoteInvoiceFilterSchema.parse(req.query);
    const customerId = getQuoteCustomerScope(req);
    const { invoices, total } = await listQuoteInvoicesService(
      req.user.shop_id,
      req.params['id']!,
      filter,
      customerId
    );
    sendSuccess(res, invoices, 200, {
      total,
      page: 1,
      limit: total || 1,
      totalPages: 1,
    });
  } catch (err) {
    next(err);
  }
};

export const getQuoteInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getQuoteCustomerScope(req);
    const invoice = await getQuoteInvoiceService(
      req.user.shop_id,
      req.params['id']!,
      req.params['invoiceId']!,
      customerId
    );
    sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
};

export const createQuoteInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { invoice } = CreateQuoteInvoiceBodySchema.parse(req.body);
    const customerId = getQuoteCustomerScope(req);
    const created = await createQuoteInvoiceService(
      req.user.shop_id,
      req.params['id']!,
      invoice,
      customerId
    );
    sendCreated(res, created);
  } catch (err) {
    next(err);
  }
};

export const updateQuoteInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { invoice } = UpdateQuoteInvoiceBodySchema.parse(req.body);
    const customerId = getQuoteCustomerScope(req);
    const updated = await updateQuoteInvoiceService(
      req.user.shop_id,
      req.params['id']!,
      req.params['invoiceId']!,
      invoice,
      customerId
    );
    sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
};

export const deleteQuoteInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = getQuoteCustomerScope(req);
    await deleteQuoteInvoiceService(
      req.user.shop_id,
      req.params['id']!,
      req.params['invoiceId']!,
      customerId
    );
    sendSuccess(res, { message: 'Cuenta de cobro eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};
