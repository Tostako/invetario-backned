"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentPlanRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const payment_plan_controller_1 = require("./payment-plan.controller");
const router = (0, express_1.Router)();
exports.paymentPlanRouter = router;
// Todos los endpoints de planes de pago requieren autenticación y shop_id
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
router.get('/', payment_plan_controller_1.listarPlanesPago);
router.post('/', payment_plan_controller_1.crearPlanPago);
router.put('/:id', (0, validateUuid_1.validateUuid)('id'), payment_plan_controller_1.actualizarPlanPago);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), payment_plan_controller_1.eliminarPlanPago);
router.patch('/:id/default', (0, validateUuid_1.validateUuid)('id'), payment_plan_controller_1.marcarPlanPagoDefault);
//# sourceMappingURL=payment-plan.routes.js.map