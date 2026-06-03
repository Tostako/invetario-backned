"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const inventory_controller_1 = require("./inventory.controller");
const router = (0, express_1.Router)();
exports.inventoryRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard, (0, authorize_1.authorize)('staff', 'admin', 'owner'));
router.get('/alerts', inventory_controller_1.obtenerAlertas);
router.get('/movements', inventory_controller_1.obtenerMovimientos);
//# sourceMappingURL=inventory.routes.js.map