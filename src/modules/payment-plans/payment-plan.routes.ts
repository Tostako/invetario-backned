import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  crearPlanPago,
  listarPlanesPago,
  actualizarPlanPago,
  eliminarPlanPago,
  marcarPlanPagoDefault,
} from './payment-plan.controller';

const router = Router();

// Todos los endpoints de planes de pago requieren autenticación y shop_id
router.use(authenticate, tenantGuard);

router.get('/', listarPlanesPago);
router.post('/', crearPlanPago);

router.put('/:id', validateUuid('id'), actualizarPlanPago);
router.delete('/:id', validateUuid('id'), eliminarPlanPago);
router.patch('/:id/default', validateUuid('id'), marcarPlanPagoDefault);

export { router as paymentPlanRouter };
