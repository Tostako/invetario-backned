"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
exports.dashboardRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard, (0, authorize_1.authorize)('staff', 'admin', 'owner'));
router.get('/summary', dashboard_controller_1.obtenerResumen);
router.get('/monthly-income', dashboard_controller_1.obtenerIngresosMes);
router.get('/monthly-orders', dashboard_controller_1.obtenerPedidosMes);
router.get('/weekly-sales', dashboard_controller_1.obtenerVentasSemana);
router.get('/order-status', dashboard_controller_1.obtenerEstadoPedidos);
router.get('/top-products', dashboard_controller_1.obtenerProductosTop);
//# sourceMappingURL=dashboard.routes.js.map