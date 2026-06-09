"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marcarPlanPagoDefault = exports.eliminarPlanPago = exports.actualizarPlanPago = exports.listarPlanesPago = exports.crearPlanPago = void 0;
const response_1 = require("../../shared/utils/response");
const payment_plan_types_1 = require("./payment-plan.types");
const payment_plan_service_1 = require("./payment-plan.service");
const getCustomerId = (req) => {
    return req.user.role === 'customer' ? req.user.customer_id : undefined;
};
// POST /api/v1/payment-plans
const crearPlanPago = async (req, res, next) => {
    try {
        const dto = payment_plan_types_1.CreatePaymentPlanSchema.parse(req.body);
        const customerId = getCustomerId(req);
        const plan = await (0, payment_plan_service_1.crearPlanPagoService)(req.user.shop_id, customerId, dto);
        (0, response_1.sendCreated)(res, plan);
    }
    catch (err) {
        next(err);
    }
};
exports.crearPlanPago = crearPlanPago;
// GET /api/v1/payment-plans
const listarPlanesPago = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req) ?? req.query['customer_id'];
        const planes = await (0, payment_plan_service_1.listarPlanesPagoService)(req.user.shop_id, customerId);
        (0, response_1.sendSuccess)(res, planes);
    }
    catch (err) {
        next(err);
    }
};
exports.listarPlanesPago = listarPlanesPago;
// PUT /api/v1/payment-plans/:id
const actualizarPlanPago = async (req, res, next) => {
    try {
        const dto = payment_plan_types_1.UpdatePaymentPlanSchema.parse(req.body);
        const customerId = getCustomerId(req);
        const plan = await (0, payment_plan_service_1.actualizarPlanPagoService)(req.user.shop_id, req.params['id'], dto, customerId);
        (0, response_1.sendSuccess)(res, plan);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarPlanPago = actualizarPlanPago;
// DELETE /api/v1/payment-plans/:id
const eliminarPlanPago = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        await (0, payment_plan_service_1.eliminarPlanPagoService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, { message: 'Plan de pago eliminado correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarPlanPago = eliminarPlanPago;
// PATCH /api/v1/payment-plans/:id/default
const marcarPlanPagoDefault = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const plan = await (0, payment_plan_service_1.marcarPlanPagoDefaultService)(req.user.shop_id, req.params['id'], customerId);
        (0, response_1.sendSuccess)(res, plan);
    }
    catch (err) {
        next(err);
    }
};
exports.marcarPlanPagoDefault = marcarPlanPagoDefault;
//# sourceMappingURL=payment-plan.controller.js.map