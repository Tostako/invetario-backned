import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { pagarConTarjeta, pagarConPse, webhookMercadoPago } from './payment.controller';

const router = Router();

// ─── Webhook (sin autenticación JWT — proviene de Mercado Pago) ───────────────
// IMPORTANTE: debe ir ANTES del middleware authenticate
router.post('/webhook', webhookMercadoPago);

// ─── Endpoints autenticados ───────────────────────────────────────────────────
router.use(authenticate, tenantGuard);

// Pago con tarjeta crédito / débito
router.post('/card', pagarConTarjeta);

// Pago por PSE
router.post('/pse', pagarConPse);

export { router as paymentRouter };
