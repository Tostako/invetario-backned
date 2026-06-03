"use strict";
// ─── Payments Repository ─────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// El trigger trg_pago_aprobado_confirma_pedido (BD) actualiza
// automáticamente el estado del pedido al aprobarse el pago.
// Funciones definidas en: database/21_fn_payments.sql
// Migración estática:    database/27_payments_estaticos.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPagosPorTienda = exports.findPaymentById = exports.findPaymentByOrder = exports.actualizarEstadoPago = exports.insertarPago = void 0;
const database_1 = require("../../config/database");
const insertarPago = async (params) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_insertar_pago($1, $2, $3, $4, $5, $6)`, [
        params.shopId,
        params.orderId,
        params.method,
        params.transactionAmount,
        params.status,
        params.statusDetail,
    ]);
    return result.rows[0];
};
exports.insertarPago = insertarPago;
const actualizarEstadoPago = async (shopId, paymentId, status, statusDetail) => {
    const result = await (0, database_1.query)(`UPDATE payments
     SET status        = $3,
         status_detail = $4,
         updated_at    = NOW()
     WHERE id = $2 AND shop_id = $1
     RETURNING *`, [shopId, paymentId, status, statusDetail]);
    return result.rows[0] ?? null;
};
exports.actualizarEstadoPago = actualizarEstadoPago;
const findPaymentByOrder = async (shopId, orderId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_pago_por_orden($1, $2)`, [shopId, orderId]);
    return result.rows[0] ?? null;
};
exports.findPaymentByOrder = findPaymentByOrder;
const findPaymentById = async (shopId, paymentId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_pago_por_id($1, $2)`, [shopId, paymentId]);
    return result.rows[0] ?? null;
};
exports.findPaymentById = findPaymentById;
const listarPagosPorTienda = async (shopId, limit = 50, offset = 0) => {
    const result = await (0, database_1.query)(`SELECT p.*, o.order_number
     FROM payments p
     JOIN orders o ON o.id = p.order_id AND o.shop_id = p.shop_id
     WHERE p.shop_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`, [shopId, limit, offset]);
    return result.rows;
};
exports.listarPagosPorTienda = listarPagosPorTienda;
//# sourceMappingURL=payment.repository.js.map