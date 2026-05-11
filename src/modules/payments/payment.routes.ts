import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { authorize } from '../../middlewares/authorize';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  registrarPago,
  listarPagos,
  obtenerPago,
  obtenerPagoPorOrden,
  actualizarPago,
} from './payment.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// Registrar pago (lo puede hacer staff, admin u owner; también customer para su propio pedido)
router.post('/', registrarPago);

// Consultar pagos
router.get('/', authorize('staff', 'admin', 'owner'), listarPagos);
router.get('/order/:orderId', validateUuid('orderId'), obtenerPagoPorOrden);
router.get('/:id', validateUuid('id'), obtenerPago);

// Actualizar estado de un pago (solo admin/owner)
router.patch('/:id', validateUuid('id'), authorize('admin', 'owner'), actualizarPago);

export { router as paymentRouter };
