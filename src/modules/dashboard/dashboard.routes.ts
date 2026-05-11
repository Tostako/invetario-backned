import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import {
  obtenerResumen,
  obtenerIngresosMes,
  obtenerPedidosMes,
  obtenerVentasSemana,
  obtenerEstadoPedidos,
  obtenerProductosTop,
} from './dashboard.controller';

const router = Router();

router.use(authenticate, tenantGuard, authorize('staff', 'admin', 'owner'));

router.get('/summary', obtenerResumen);
router.get('/monthly-income', obtenerIngresosMes);
router.get('/monthly-orders', obtenerPedidosMes);
router.get('/weekly-sales', obtenerVentasSemana);
router.get('/order-status', obtenerEstadoPedidos);
router.get('/top-products', obtenerProductosTop);

export { router as dashboardRouter };
