"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../middlewares/authenticate");
const authorize_1 = require("../../middlewares/authorize");
const tenantGuard_1 = require("../../middlewares/tenantGuard");
const requireShopStaff_1 = require("../../middlewares/requireShopStaff");
const shop_controller_1 = require("./shop.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
exports.shopRouter = router;
router.use(authenticate_1.authenticate, tenantGuard_1.tenantGuard, requireShopStaff_1.requireShopStaff);
router.get('/', shop_controller_1.obtenerTienda);
router.patch('/', (0, authorize_1.authorize)('admin', 'owner'), shop_controller_1.actualizarTienda);
router.patch('/logo', (0, authorize_1.authorize)('admin', 'owner'), upload_1.upload.single('logo'), shop_controller_1.subirLogoTienda);
router.delete('/', (0, authorize_1.authorize)('owner'), shop_controller_1.eliminarTienda);
//# sourceMappingURL=shop.routes.js.map