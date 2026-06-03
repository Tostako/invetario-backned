// ─── Quotes Service ───────────────────────────────────────────────────────────
// Traduce errores de BD. Admin ve todas las cotizaciones de la tienda;
// Customer solo ve las suyas (filtrado por customer_id en el repository).
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllQuotes,
  findQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
} from './quote.repository';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteFilter,
  Quote,
} from './quote.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

export const listQuotesService = async (
  shopId: string,
  filter: QuoteFilter,
  customerId?: string
): Promise<{ quotes: Quote[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllQuotes(shopId, filter, customerId);
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

  return quote;
};

export const createQuoteService = async (
  shopId: string,
  customerId: string,
  dto: CreateQuoteDto
): Promise<Quote> => {
  return await createQuote(shopId, customerId, dto);
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
    return updated;
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
