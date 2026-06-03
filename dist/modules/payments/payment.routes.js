"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const authorize_1 = require("../../middlewares/authorize");
const validateUuid_1 = require("../../middlewares/validateUuid");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
exports.paymentRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// Registrar pago (lo puede hacer staff, admin u owner; también customer para su propio pedido)
router.post('/', payment_controller_1.registrarPago);
// Consultar pagos
router.get('/', (0, authorize_1.authorize)('staff', 'admin', 'owner'), payment_controller_1.listarPagos);
router.get('/order/:orderId', (0, validateUuid_1.validateUuid)('orderId'), payment_controller_1.obtenerPagoPorOrden);
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), payment_controller_1.obtenerPago);
// Actualizar estado de un pago (solo admin/owner)
router.patch('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), payment_controller_1.actualizarPago);
//# sourceMappingURL=payment.routes.js.map