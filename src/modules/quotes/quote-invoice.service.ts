import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { traducirErrorDB } from '../../shared/utils/dbErrors';
import { findQuoteById } from './quote.repository';
import {
  findQuoteInvoices,
  findQuoteInvoiceById,
  createQuoteInvoice,
  updateQuoteInvoice,
  deleteQuoteInvoice,
} from './quote-invoice.repository';
import {
  CreateQuoteInvoiceDto,
  UpdateQuoteInvoiceDto,
  QuoteInvoiceFilter,
  QuoteInvoice,
  QuoteInvoiceListItem,
} from './quote-invoice.types';

const ensureQuoteAccess = async (
  shopId: string,
  quoteId: string,
  customerId?: string
): Promise<void> => {
  const quote = await findQuoteById(shopId, quoteId);
  if (!quote) throw new NotFoundError('Cotización');

  if (customerId && quote.customer_id !== customerId) {
    throw new ForbiddenError('No puedes acceder a cotizaciones de otros clientes');
  }
};

export const listQuoteInvoicesService = async (
  shopId: string,
  quoteId: string,
  filter: QuoteInvoiceFilter,
  customerId?: string
): Promise<{ invoices: QuoteInvoiceListItem[]; total: number }> => {
  await ensureQuoteAccess(shopId, quoteId, customerId);

  try {
    const { rows, total } = await findQuoteInvoices(shopId, quoteId, filter);
    return {
      invoices: rows,
      total,
    };
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
    });
  }
};

export const getQuoteInvoiceService = async (
  shopId: string,
  quoteId: string,
  invoiceId: string,
  customerId?: string
): Promise<QuoteInvoice> => {
  await ensureQuoteAccess(shopId, quoteId, customerId);

  try {
    const invoice = await findQuoteInvoiceById(shopId, quoteId, invoiceId);
    if (!invoice) throw new NotFoundError('Cuenta de cobro');
    return invoice;
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
      INVOICE_NOT_FOUND: () => new NotFoundError('Cuenta de cobro'),
    });
  }
};

export const createQuoteInvoiceService = async (
  shopId: string,
  quoteId: string,
  dto: CreateQuoteInvoiceDto,
  customerId?: string
): Promise<QuoteInvoice> => {
  await ensureQuoteAccess(shopId, quoteId, customerId);

  try {
    return await createQuoteInvoice(shopId, quoteId, dto);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
      INVOICE_NUMBER_DUPLICATE: () =>
        new ConflictError('Ya existe una cuenta de cobro con ese número para esta cotización'),
      INVALID_TOTAL_AMOUNT: () =>
        new ValidationError('total_amount debe ser mayor que cero'),
      FORM_SNAPSHOT_REQUIRED: () =>
        new ValidationError('form_data_snapshot es obligatorio'),
    });
  }
};

export const updateQuoteInvoiceService = async (
  shopId: string,
  quoteId: string,
  invoiceId: string,
  dto: UpdateQuoteInvoiceDto,
  customerId?: string
): Promise<QuoteInvoice> => {
  await ensureQuoteAccess(shopId, quoteId, customerId);

  try {
    const invoice = await updateQuoteInvoice(
      shopId,
      quoteId,
      invoiceId,
      dto.status,
      dto.paid_at
    );
    if (!invoice) throw new NotFoundError('Cuenta de cobro');
    return invoice;
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
      INVOICE_NOT_FOUND: () => new NotFoundError('Cuenta de cobro'),
      INVALID_INVOICE_STATUS: () =>
        new ValidationError('status debe ser pending, partial o paid'),
    });
  }
};

export const deleteQuoteInvoiceService = async (
  shopId: string,
  quoteId: string,
  invoiceId: string,
  customerId?: string
): Promise<void> => {
  await ensureQuoteAccess(shopId, quoteId, customerId);

  try {
    await deleteQuoteInvoice(shopId, quoteId, invoiceId);
  } catch (err) {
    throw traducirErrorDB(err, {
      QUOTE_NOT_FOUND: () => new NotFoundError('Cotización'),
      INVOICE_NOT_FOUND: () => new NotFoundError('Cuenta de cobro'),
    });
  }
};
