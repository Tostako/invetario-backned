import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} from './offer.controller';

// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller

const router = Router();

// Los tres primeros middlewares aplican a TODO el módulo
router.use(authenticate, tenantGuard);

// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', listOffers);

router.post('/',
  authorize('admin', 'owner'),
  createOffer
);

// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id',
  validateUuid('id'),
  getOffer
);

router.patch('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  updateOffer
);

router.delete('/:id',
  validateUuid('id'),
  authorize('owner'),
  deleteOffer
);

export { router as offerRouter };
