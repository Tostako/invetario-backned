"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
exports.orderRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// HU8 – Finalizar compra (cualquier rol autenticado)
router.post('/', order_controller_1.crearPedido);
// HU9 – Listar pedidos (admin y owner)
router.get('/', (0, authorize_1.authorize)('admin', 'owner'), order_controller_1.listarPedidos);
// Listar mis pedidos (customer autenticado)
router.get('/my-orders', order_controller_1.listarMisPedidos);
// Detalle de un pedido
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), order_controller_1.obtenerPedido);
// HU10 – Actualizar estado (solo admin y owner)
router.patch('/:id/estado', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), order_controller_1.actualizarEstado);
//# sourceMappingURL=order.routes.js.map