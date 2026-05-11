import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestLogger } from './middlewares/requestLogger';
import { authRateLimiter, apiRateLimiter } from './middlewares/rateLimiters';
import { authRouter } from './modules/auth/auth.routes';
import { productRouter } from './modules/products/product.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { orderRouter } from './modules/orders/order.routes';
import { paymentRouter } from './modules/payments/payment.routes';
import { categoryRouter } from './modules/categories/category.routes';
import { superAdminRouter } from './modules/superadmin/superadmin.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { inventoryRouter } from './modules/inventory/inventory.routes';
import { customerRouter } from './modules/customers/customer.routes';
import { shopRouter } from './modules/shop/shop.routes';
import { userRouter } from './modules/users/user.routes';
import { publicRouter } from './modules/public/public.routes';
import { authenticate } from './middlewares/authenticate';
import { createAdditionalShop } from './modules/auth/auth.controller';

const app = express();

// ─── Seguridad HTTP ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? '*',
  credentials: true,
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Health check (sin rate limit, sin auth) ──────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
// Auth: rate limit estricto (anti brute-force)
app.use('/api/v1/auth', authRateLimiter, authRouter);

// Resto de la API: rate limit general
app.use('/api/v1', apiRateLimiter);

// ─── Rutas PÚBLICAS (sin autenticación) ───────────────────────────────────────
app.use('/api/v1/public', publicRouter);

// ─── Rutas protegidas ─────────────────────────────────────────────────────────
app.use('/api/v1/products', productRouter);
app.use('/api/v1/shop', shopRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/admin', superAdminRouter);

// Gestión de múltiples tiendas para un usuario
app.post('/api/v1/shops', authenticate, createAdditionalShop);

// ─── Manejo de errores (siempre al final) ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
