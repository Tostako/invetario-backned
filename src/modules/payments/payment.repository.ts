// ─── Payments Repository ─────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// El trigger trg_pago_aprobado_confirma_pedido (BD) actualiza
// automáticamente el estado del pedido al aprobarse el pago.
// Funciones definidas en: database/21_fn_payments.sql
// Migración estática:    database/27_payments_estaticos.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { Payment } from './payment.types';

interface InsertarPagoParams {
  shopId:            string;
  orderId:           string;
  method:            string;
  transactionAmount: number;
  status:            string;
  statusDetail:      string | null;
  notes:             string | null;
}

export const insertarPago = async (params: InsertarPagoParams): Promise<Payment> => {
  const result = await query<Payment>(
    `SELECT * FROM sp_insertar_pago($1, $2, $3, $4, $5, $6)`,
    [
      params.shopId,
      params.orderId,
      params.method,
      params.transactionAmount,
      params.status,
      params.statusDetail,
    ]
  );
  return result.rows[0]!;
};

export const actualizarEstadoPago = async (
  shopId:      string,
  paymentId:   string,
  status:      string,
  statusDetail: string | null
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `UPDATE payments
     SET status        = $3,
         status_detail = $4,
         updated_at    = NOW()
     WHERE id = $2 AND shop_id = $1
     RETURNING *`,
    [shopId, paymentId, status, statusDetail]
  );
  return result.rows[0] ?? null;
};

export const findPaymentByOrder = async (
  shopId:  string,
  orderId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM fn_obtener_pago_por_orden($1, $2)`,
    [shopId, orderId]
  );
  return result.rows[0] ?? null;
};

export const findPaymentById = async (
  shopId:    string,
  paymentId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM fn_obtener_pago_por_id($1, $2)`,
    [shopId, paymentId]
  );
  return result.rows[0] ?? null;
};

export const listarPagosPorTienda = async (
  shopId: string,
  limit   = 50,
  offset  = 0
): Promise<Payment[]> => {
  const result = await query<Payment>(
    `SELECT p.*, o.order_number
     FROM payments p
     JOIN orders o ON o.id = p.order_id AND o.shop_id = p.shop_id
     WHERE p.shop_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [shopId, limit, offset]
  );
  return result.rows;
};
