"use strict";
// ─── Payments Service — Modo estático ────────────────────────────────────────
// Todos los pagos se registran directamente como "approved".
// No hay integración con ninguna pasarela de pago externa.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarPagoService = exports.listarPagosService = exports.obtenerPagoPorOrdenService = exports.obtenerPagoService = exports.registrarPagoService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const order_repository_1 = require("../orders/order.repository");
const payment_repository_1 = require("./payment.repository");
// ─── Helper: validar que la orden exista y sea pagable ────────────────────────
const validarOrden = async (shopId, orderId, customerId) => {
    const orden = await (0, order_repository_1.findOrderById)(shopId, orderId);
    if (!orden)
        throw new AppError_1.NotFoundError('Pedido');
    if (customerId && orden.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No tienes permiso para pagar este pedido.');
    }
    if (orden.status === 'cancelled') {
        throw new AppError_1.ValidationError('No se puede pagar un pedido cancelado.');
    }
    const pagoExistente = await (0, payment_repository_1.findPaymentByOrder)(shopId, orderId);
    if (pagoExistente?.status === 'approved') {
        throw new AppError_1.ValidationError('Este pedido ya fue pagado.');
    }
    return orden;
};
// ─── Registrar pago (siempre se aprueba automáticamente) ─────────────────────
const registrarPagoService = async (shopId, customerId, dto) => {
    const orden = await validarOrden(shopId, dto.order_id, customerId);
    return (0, payment_repository_1.insertarPago)({
        shopId,
        orderId: dto.order_id,
        method: dto.method,
        transactionAmount: Number(orden.total),
        status: 'approved',
        statusDetail: 'static_approved',
        notes: dto.notes ?? null,
    });
};
exports.registrarPagoService = registrarPagoService;
// ─── Obtener pago por ID ──────────────────────────────────────────────────────
const obtenerPagoService = async (shopId, paymentId) => {
    const pago = await (0, payment_repository_1.findPaymentById)(shopId, paymentId);
    if (!pago)
        throw new AppError_1.NotFoundError('Pago');
    return pago;
};
exports.obtenerPagoService = obtenerPagoService;
// ─── Obtener pago de una orden ────────────────────────────────────────────────
const obtenerPagoPorOrdenService = async (shopId, orderId) => {
    return (0, payment_repository_1.findPaymentByOrder)(shopId, orderId);
};
exports.obtenerPagoPorOrdenService = obtenerPagoPorOrdenService;
// ─── Listar pagos de la tienda ────────────────────────────────────────────────
const listarPagosService = async (shopId, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    return (0, payment_repository_1.listarPagosPorTienda)(shopId, limit, offset);
};
exports.listarPagosService = listarPagosService;
// ─── Actualizar estado de un pago (sólo admin/owner) ─────────────────────────
const actualizarPagoService = async (shopId, paymentId, dto) => {
    const pago = await (0, payment_repository_1.findPaymentById)(shopId, paymentId);
    if (!pago)
        throw new AppError_1.NotFoundError('Pago');
    const actualizado = await (0, payment_repository_1.actualizarEstadoPago)(shopId, paymentId, dto.status, dto.notes ?? null);
    return actualizado;
};
exports.actualizarPagoService = actualizarPagoService;
//# sourceMappingURL=payment.service.js.map