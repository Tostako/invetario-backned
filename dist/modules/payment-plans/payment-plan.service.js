"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marcarPlanPagoDefaultService = exports.eliminarPlanPagoService = exports.actualizarPlanPagoService = exports.obtenerPlanPagoService = exports.listarPlanesPagoService = exports.crearPlanPagoService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const payment_plan_repository_1 = require("./payment-plan.repository");
const crearPlanPagoService = async (shopId, customerId, dto) => {
    // Si el usuario es customer, se asocia el plan obligatoriamente a él
    // Si es un rol del staff/admin, debe proporcionar el customer_id al que pertenece el plan
    const targetCustomerId = customerId ?? dto.customer_id;
    if (!targetCustomerId) {
        throw new AppError_1.ValidationError('El customer_id es obligatorio para crear un plan de pago.');
    }
    try {
        return await (0, payment_plan_repository_1.dbCrearPlanPago)(shopId, targetCustomerId, dto);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CUSTOMER_NOT_FOUND: () => new AppError_1.NotFoundError('Cliente'),
        });
    }
};
exports.crearPlanPagoService = crearPlanPagoService;
const listarPlanesPagoService = async (shopId, customerId) => {
    return await (0, payment_plan_repository_1.dbListarPlanesPago)(shopId, customerId);
};
exports.listarPlanesPagoService = listarPlanesPagoService;
const obtenerPlanPagoService = async (shopId, planId, customerId) => {
    const plan = await (0, payment_plan_repository_1.dbObtenerPlanPago)(shopId, planId);
    if (!plan)
        throw new AppError_1.NotFoundError('Plan de pago');
    // Si es un cliente, verificar que el plan le pertenece
    if (customerId && plan.customer_id !== customerId) {
        throw new AppError_1.ForbiddenError('No tienes permiso para ver este plan de pagos.');
    }
    return plan;
};
exports.obtenerPlanPagoService = obtenerPlanPagoService;
const actualizarPlanPagoService = async (shopId, planId, dto, customerId) => {
    // Verificar existencia y pertenencia
    await (0, exports.obtenerPlanPagoService)(shopId, planId, customerId);
    try {
        const updated = await (0, payment_plan_repository_1.dbActualizarPlanPago)(shopId, planId, dto);
        if (!updated)
            throw new AppError_1.NotFoundError('Plan de pago');
        return updated;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PLAN_NOT_FOUND: () => new AppError_1.NotFoundError('Plan de pago'),
        });
    }
};
exports.actualizarPlanPagoService = actualizarPlanPagoService;
const eliminarPlanPagoService = async (shopId, planId, customerId) => {
    // Verificar existencia y pertenencia
    await (0, exports.obtenerPlanPagoService)(shopId, planId, customerId);
    try {
        await (0, payment_plan_repository_1.dbEliminarPlanPago)(shopId, planId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PLAN_NOT_FOUND: () => new AppError_1.NotFoundError('Plan de pago'),
        });
    }
};
exports.eliminarPlanPagoService = eliminarPlanPagoService;
const marcarPlanPagoDefaultService = async (shopId, planId, customerId) => {
    // Verificar existencia y pertenencia
    await (0, exports.obtenerPlanPagoService)(shopId, planId, customerId);
    try {
        const plan = await (0, payment_plan_repository_1.dbMarcarPlanPagoDefault)(shopId, planId);
        if (!plan)
            throw new AppError_1.NotFoundError('Plan de pago');
        return plan;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PLAN_NOT_FOUND: () => new AppError_1.NotFoundError('Plan de pago'),
        });
    }
};
exports.marcarPlanPagoDefaultService = marcarPlanPagoDefaultService;
//# sourceMappingURL=payment-plan.service.js.map