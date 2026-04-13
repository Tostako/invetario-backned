import { query } from '../../config/database';
import { Payment } from './payment.types';

// REGLA: shop_id obligatorio en todos los accesos (aislamiento multitenant)

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
    `INSERT INTO payments
       (shop_id, order_id, mp_payment_id, method, status, status_detail,
        transaction_amount, external_resource_url, raw_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
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
    `UPDATE payments
     SET status        = $1,
         status_detail = $2,
         raw_response  = $3,
         updated_at    = NOW()
     WHERE mp_payment_id = $4
     RETURNING *`,
    [status, statusDetail, JSON.stringify(rawResponse), mpPaymentId]
  );
  return result.rows[0] ?? null;
};

export const findPaymentByOrder = async (
  shopId: string,
  orderId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM payments
     WHERE shop_id = $1 AND order_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [shopId, orderId]
  );
  return result.rows[0] ?? null;
};

export const findPaymentById = async (
  shopId: string,
  paymentId: string
): Promise<Payment | null> => {
  const result = await query<Payment>(
    `SELECT * FROM payments WHERE id = $1 AND shop_id = $2`,
    [paymentId, shopId]
  );
  return result.rows[0] ?? null;
};
