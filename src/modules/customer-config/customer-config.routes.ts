import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listCustomerConfigs,
  getCustomerConfig,
  deleteCustomerConfig,
  getOwnCustomerConfig,
  upsertOwnCustomerConfig,
} from './customer-config.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// ─── Rutas del Customer (propio) ─────────────────────────────────────────────
// /api/v1/customer-config/me  →  ver y editar MI config
router.get('/me', getOwnCustomerConfig);

router.put('/me', upsertOwnCustomerConfig);

// ─── Rutas del Admin ─────────────────────────────────────────────────────────
router.get('/', authorize('admin', 'owner'), listCustomerConfigs);

router.get('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  getCustomerConfig
);

router.delete('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  deleteCustomerConfig
);

export { router as customerConfigRouter };
