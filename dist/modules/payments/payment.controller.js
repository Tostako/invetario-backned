"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarPago = exports.obtenerPagoPorOrden = exports.obtenerPago = exports.listarPagos = exports.registrarPago = void 0;
const response_1 = require("../../shared/utils/response");
const payment_types_1 = require("./payment.types");
const payment_service_1 = require("./payment.service");
// POST /api/v1/payments
const registrarPago = async (req, res, next) => {
    try {
        const dto = payment_types_1.RegistrarPagoSchema.parse(req.body);
        const customerId = req.user.role === 'customer' ? req.user.customer_id : undefined;
        const pago = await (0, payment_service_1.registrarPagoService)(req.user.shop_id, customerId, dto);
        (0, response_1.sendCreated)(res, pago);
    }
    catch (err) {
        next(err);
    }
};
exports.registrarPago = registrarPago;
// GET /api/v1/payments
const listarPagos = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const pagos = await (0, payment_service_1.listarPagosService)(req.user.shop_id, page, limit);
        (0, response_1.sendSuccess)(res, pagos);
    }
    catch (err) {
        next(err);
    }
};
exports.listarPagos = listarPagos;
// GET /api/v1/payments/:id
const obtenerPago = async (req, res, next) => {
    try {
        const pago = await (0, payment_service_1.obtenerPagoService)(req.user.shop_id, req.params.id);
        (0, response_1.sendSuccess)(res, pago);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPago = obtenerPago;
// GET /api/v1/payments/order/:orderId
const obtenerPagoPorOrden = async (req, res, next) => {
    try {
        const pago = await (0, payment_service_1.obtenerPagoPorOrdenService)(req.user.shop_id, req.params.orderId);
        (0, response_1.sendSuccess)(res, pago ?? null);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPagoPorOrden = obtenerPagoPorOrden;
// PATCH /api/v1/payments/:id
const actualizarPago = async (req, res, next) => {
    try {
        const dto = payment_types_1.ActualizarPagoSchema.parse(req.body);
        const pago = await (0, payment_service_1.actualizarPagoService)(req.user.shop_id, req.params.id, dto);
        (0, response_1.sendSuccess)(res, pago);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarPago = actualizarPago;
//# sourceMappingURL=payment.controller.js.map