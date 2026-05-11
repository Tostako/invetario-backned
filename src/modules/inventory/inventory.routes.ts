import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { obtenerAlertas, obtenerMovimientos } from './inventory.controller';

const router = Router();

router.use(authenticate, tenantGuard, authorize('staff', 'admin', 'owner'));

router.get('/alerts', obtenerAlertas);
router.get('/movements', obtenerMovimientos);

export { router as inventoryRouter };
