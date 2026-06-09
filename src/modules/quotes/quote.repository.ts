// ─── Quotes Repository ────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/37_fn_quotes.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateQuoteDto, UpdateQuoteDto, QuoteFilter, Quote } from './quote.types';
import { Payment } from '../payments/payment.types';

interface FindAllResult {
  rows: Quote[];
  total: number;
}

export const findAllQuotes = async (
  shopId: string,
  filter: QuoteFilter,
  customerId?: string
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<Quote & { total_count: string }>(
    `SELECT * FROM fn_listar_cotizaciones($1, $2, $3, $4, $5)`,
    [
      shopId,
      customerId ?? null,
      filter.status ?? null,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findQuoteById = async (
  shopId: string,
  quoteId: string
): Promise<Quote | null> => {
  const result = await query<Quote>(
    `SELECT * FROM fn_obtener_cotizacion($1, $2)`,
    [shopId, quoteId]
  );
  return result.rows[0] ?? null;
};

export const createQuote = async (
  shopId: string,
  customerId: string,
  dto: CreateQuoteDto
): Promise<Quote> => {
  const result = await query<Quote>(
    `SELECT * FROM sp_crear_cotizacion($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      shopId,
      customerId,
      dto.client,
      dto.project,
      dto.area,
      dto.price,
      dto.status,
      JSON.stringify(dto.data),
      dto.date ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateQuote = async (
  shopId: string,
  quoteId: string,
  dto: UpdateQuoteDto
): Promise<Quote | null> => {
  const result = await query<Quote>(
    `SELECT * FROM sp_actualizar_cotizacion($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      shopId,
      quoteId,
      null, // customer_id no se cambia
      dto.client ?? null,
      dto.project ?? null,
      dto.area ?? null,
      dto.price ?? null,
      dto.status ?? null,
      dto.data ? JSON.stringify(dto.data) : null,
      dto.date ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const deleteQuote = async (
  shopId: string,
  quoteId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_cotizacion($1, $2)`, [shopId, quoteId]);
  return true;
};

export const asignarPlanACotizacion = async (
  shopId: string,
  quoteId: string,
  planId: string | null
): Promise<Quote> => {
  const result = await query<Quote>(
    `SELECT * FROM sp_asignar_plan_cotizacion($1, $2, $3)`,
    [shopId, quoteId, planId]
  );
  return result.rows[0]!;
};

export const registrarPagoManual = async (
  shopId: string,
  quoteId: string,
  method: string,
  amount: number,
  installmentIdx: number | null,
  notes: string | null,
  userId: string | null
): Promise<Payment> => {
  const result = await query<Payment>(
    `SELECT * FROM sp_registrar_pago_manual_cotizacion($1, $2, $3, $4, $5, $6, $7)`,
    [shopId, quoteId, method, amount, installmentIdx, notes, userId]
  );
  return result.rows[0]!;
};

export const findPaymentsByQuote = async (
  shopId: string,
  quoteId: string
): Promise<Payment[]> => {
  const result = await query<Payment>(
    `SELECT * FROM fn_listar_pagos_cotizacion($1, $2)`,
    [shopId, quoteId]
  );
  return result.rows;
};
