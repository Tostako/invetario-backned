"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const requestLogger_1 = require("./middlewares/requestLogger");
const rateLimiters_1 = require("./middlewares/rateLimiters");
const auth_routes_1 = require("./modules/auth/auth.routes");
const product_routes_1 = require("./modules/products/product.routes");
const cart_routes_1 = require("./modules/cart/cart.routes");
const order_routes_1 = require("./modules/orders/order.routes");
const payment_routes_1 = require("./modules/payments/payment.routes");
const category_routes_1 = require("./modules/categories/category.routes");
const superadmin_routes_1 = require("./modules/superadmin/superadmin.routes");
const dashboard_routes_1 = require("./modules/dashboard/dashboard.routes");
const inventory_routes_1 = require("./modules/inventory/inventory.routes");
const customer_routes_1 = require("./modules/customers/customer.routes");
const shop_routes_1 = require("./modules/shop/shop.routes");
const user_routes_1 = require("./modules/users/user.routes");
const public_routes_1 = require("./modules/public/public.routes");
const offer_routes_1 = require("./modules/offers/offer.routes");
const authenticate_1 = require("./middlewares/authenticate");
const auth_controller_1 = require("./modules/auth/auth.controller");
const app = (0, express_1.default)();
// ─── Seguridad HTTP ───────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? '*',
    credentials: true,
}));
// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express_1.default.static('uploads'));
// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger_1.requestLogger);
// ─── Health check (sin rate limit, sin auth) ──────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});
// ─── Rutas de la API ──────────────────────────────────────────────────────────
// Auth: rate limit estricto (anti brute-force)
app.use('/api/v1/auth', rateLimiters_1.authRateLimiter, auth_routes_1.authRouter);
// Resto de la API: rate limit general
app.use('/api/v1', rateLimiters_1.apiRateLimiter);
// ─── Rutas PÚBLICAS (sin autenticación) ───────────────────────────────────────
app.use('/api/v1/public', public_routes_1.publicRouter);
// ─── Rutas protegidas ─────────────────────────────────────────────────────────
app.use('/api/v1/products', product_routes_1.productRouter);
app.use('/api/v1/shop', shop_routes_1.shopRouter);
app.use('/api/v1/users', user_routes_1.userRouter);
app.use('/api/v1/dashboard', dashboard_routes_1.dashboardRouter);
app.use('/api/v1/inventory', inventory_routes_1.inventoryRouter);
app.use('/api/v1/customers', customer_routes_1.customerRouter);
app.use('/api/v1/cart', cart_routes_1.cartRouter);
app.use('/api/v1/orders', order_routes_1.orderRouter);
app.use('/api/v1/payments', payment_routes_1.paymentRouter);
app.use('/api/v1/categories', category_routes_1.categoryRouter);
app.use('/api/v1/offers', offer_routes_1.offerRouter);
app.use('/api/v1/admin', superadmin_routes_1.superAdminRouter);
// Gestión de múltiples tiendas para un usuario
app.post('/api/v1/shops', authenticate_1.authenticate, auth_controller_1.createAdditionalShop);
// ─── Manejo de errores (siempre al final) ─────────────────────────────────────
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map