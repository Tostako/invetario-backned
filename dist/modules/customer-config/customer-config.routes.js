"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerConfigRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const validateUuid_1 = require("../../middlewares/validateUuid");
const customer_config_controller_1 = require("./customer-config.controller");
const router = (0, express_1.Router)();
exports.customerConfigRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard);
// ─── Rutas del Customer (propio) ─────────────────────────────────────────────
// /api/v1/customer-config/me  →  ver y editar MI config
router.get('/me', customer_config_controller_1.getOwnCustomerConfig);
router.put('/me', customer_config_controller_1.upsertOwnCustomerConfig);
// ─── Rutas del Admin ─────────────────────────────────────────────────────────
router.get('/', (0, authorize_1.authorize)('admin', 'owner'), customer_config_controller_1.listCustomerConfigs);
router.get('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), customer_config_controller_1.getCustomerConfig);
router.delete('/:id', (0, validateUuid_1.validateUuid)('id'), (0, authorize_1.authorize)('admin', 'owner'), customer_config_controller_1.deleteCustomerConfig);
//# sourceMappingURL=customer-config.routes.js.map