"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbObtenerPlanPago = exports.dbListarPlanesPago = exports.dbMarcarPlanPagoDefault = exports.dbEliminarPlanPago = exports.dbActualizarPlanPago = exports.dbCrearPlanPago = void 0;
const database_1 = require("../../config/database");
const dbCrearPlanPago = async (shopId, customerId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_plan_pago($1, $2, $3, $4, $5, $6)`, [
        shopId,
        customerId,
        dto.name,
        dto.description ?? null,
        JSON.stringify(dto.installments),
        dto.is_default ?? false,
    ]);
    return result.rows[0];
};
exports.dbCrearPlanPago = dbCrearPlanPago;
const dbActualizarPlanPago = async (shopId, planId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_plan_pago($1, $2, $3, $4, $5, $6)`, [
        shopId,
        planId,
        dto.name ?? null,
        dto.description ?? null,
        dto.installments ? JSON.stringify(dto.installments) : null,
        dto.is_default !== undefined ? dto.is_default : null,
    ]);
    return result.rows[0] ?? null;
};
exports.dbActualizarPlanPago = dbActualizarPlanPago;
const dbEliminarPlanPago = async (shopId, planId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_plan_pago($1, $2)`, [shopId, planId]);
    return true;
};
exports.dbEliminarPlanPago = dbEliminarPlanPago;
const dbMarcarPlanPagoDefault = async (shopId, planId) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_marcar_plan_pago_default($1, $2)`, [shopId, planId]);
    return result.rows[0] ?? null;
};
exports.dbMarcarPlanPagoDefault = dbMarcarPlanPagoDefault;
const dbListarPlanesPago = async (shopId, customerId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_planes_pago($1, $2)`, [shopId, customerId ?? null]);
    return result.rows;
};
exports.dbListarPlanesPago = dbListarPlanesPago;
const dbObtenerPlanPago = async (shopId, planId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_plan_pago($1, $2)`, [shopId, planId]);
    return result.rows[0] ?? null;
};
exports.dbObtenerPlanPago = dbObtenerPlanPago;
//# sourceMappingURL=payment-plan.repository.js.map