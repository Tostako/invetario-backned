import { query } from '../../config/database';
import {
  CreateQuoteInvoiceDto,
  QuoteInvoice,
  QuoteInvoiceFilter,
  QuoteInvoiceStatus,
} from './quote-invoice.types';

interface FindAllResult {
  rows: QuoteInvoiceListRow[];
  total: number;
}

interface QuoteInvoiceListRow extends Omit<QuoteInvoice, 'form_data_snapshot'> {
  total_count: string;
}

export const findQuoteInvoices = async (
  shopId: string,
  quoteId: string,
  filter: QuoteInvoiceFilter
): Promise<FindAllResult> => {
  const sortDir = filter.sort === 'created_at:asc' ? 'asc' : 'desc';
  const result = await query<QuoteInvoiceListRow>(
    `SELECT * FROM fn_listar_cuentas_cobro_cotizacion($1, $2, $3, $4)`,
    [shopId, quoteId, filter.status ?? null, sortDir]
  );

  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count, 10) : 0,
  };
};

export const findQuoteInvoiceById = async (
  shopId: string,
  quoteId: string,
  invoiceId: string
): Promise<QuoteInvoice | null> => {
  const result = await query<QuoteInvoice>(
    `SELECT * FROM fn_obtener_cuenta_cobro($1, $2, $3)`,
    [shopId, quoteId, invoiceId]
  );
  return result.rows[0] ?? null;
};

export const createQuoteInvoice = async (
  shopId: string,
  quoteId: string,
  dto: CreateQuoteInvoiceDto
): Promise<QuoteInvoice> => {
  const result = await query<QuoteInvoice>(
    `SELECT * FROM sp_crear_cuenta_cobro($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      shopId,
      quoteId,
      dto.number ?? null,
      dto.client,
      dto.project,
      dto.description,
      dto.total_amount,
      JSON.stringify(dto.form_data_snapshot),
      dto.created_at ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateQuoteInvoice = async (
  shopId: string,
  quoteId: string,
  invoiceId: string,
  status?: QuoteInvoiceStatus,
  paidAt?: string | null
): Promise<QuoteInvoice | null> => {
  const result = await query<QuoteInvoice>(
    `SELECT * FROM sp_actualizar_cuenta_cobro($1, $2, $3, $4, $5)`,
    [shopId, quoteId, invoiceId, status ?? null, paidAt ?? null]
  );
  return result.rows[0] ?? null;
};

export const deleteQuoteInvoice = async (
  shopId: string,
  quoteId: string,
  invoiceId: string
): Promise<void> => {
  await query(`SELECT sp_eliminar_cuenta_cobro($1, $2, $3)`, [shopId, quoteId, invoiceId]);
};
