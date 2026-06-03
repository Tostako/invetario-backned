import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listSiteConfigs,
  getSiteConfig,
  createSiteConfig,
  updateSiteConfig,
  deleteSiteConfig,
} from './site-config.controller';

// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller

const router = Router();

// Los tres primeros middlewares aplican a TODO el módulo
router.use(authenticate, tenantGuard);

// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', authorize('admin', 'owner'), listSiteConfigs);

router.post('/', authorize('admin', 'owner'), createSiteConfig);

// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  getSiteConfig
);

router.patch('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  updateSiteConfig
);

router.delete('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  deleteSiteConfig
);

export { router as siteConfigRouter };
