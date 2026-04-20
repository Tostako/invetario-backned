// ─── Payments Repository ─────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// El trigger trg_pago_aprobado_confirma_pedido (BD) actualiza
// automáticamente el estado del pedido al aprobarse el pago.
// Funciones definidas en: database/21_fn_payments.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { Payment } from './payment.types';

interface InsertarPagoParams {
  shopId:              string;
  orderId:             string;
  mpPaymentId:         number | null;
  method:              'card' | 'pse';
  status:              string;
  statusDetail:        string | null;
  transactionAmount:   number;
  externalResourceUrl: string | null;
  rawResponse:         unknown;
}

export const insertarPago = async (params: InsertarPagoParams): Promise<Payment> => {
  const result = await query<Payment>(
    `SELECT * FROM sp_insertar_pago($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
    [
      params.shopId,
      params.orderId,
      params.mpPaymentId,
      params.method,
      params.status,
      params.statusDetail,
      params.transactionAmount,
      params.externalResourceUrl,
      JSON.stringify(params.rawResponse),
    ]
  );
  return result.rows[0]!;
};

export const actualizarEstadoPago = async (
  mpPaymentId: number,
  status: string,
  statusDetail: string | null,
  rawResponse: unknown
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM sp_actualizar_estado_pago($1, $2, $3, $4::jsonb)`,
    [mpPaymentId, status, statusDetail, JSON.stringify(rawResponse)]
  );
  return result.rows[0] ?? null;
};

export const findPaymentByOrder = async (
  shopId: string,
  orderId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM fn_obtener_pago_por_orden($1, $2)`,
    [shopId, orderId]
  );
  return result.rows[0] ?? null;
};

export const findPaymentById = async (
  shopId: string,
  paymentId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM fn_obtener_pago_por_id($1, $2)`,
    [shopId, paymentId]
  );
  return result.rows[0] ?? null;
};
