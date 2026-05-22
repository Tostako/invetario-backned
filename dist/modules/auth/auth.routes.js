"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const router = (0, express_1.Router)();
exports.authRouter = router;
// POST /api/v1/auth/login
router.post('/login', auth_controller_1.login);
// POST /api/v1/auth/select-shop
router.post('/select-shop', authenticate_1.authenticate, auth_controller_1.selectShop);
// POST /api/v1/auth/register
router.post('/register', auth_controller_1.registerShop);
// POST /api/v1/auth/customer/login
router.post('/customer/login', auth_controller_1.loginCustomer);
// POST /api/v1/auth/customer/register
router.post('/customer/register', auth_controller_1.registerCustomer);
// GET /api/v1/auth/shops
router.get('/shops', authenticate_1.authenticate, auth_controller_1.getUserShops);
// POST /api/v1/auth/switch-shop
router.post('/switch-shop', authenticate_1.authenticate, auth_controller_1.switchShop);
//# sourceMappingURL=auth.routes.js.map