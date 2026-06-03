import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listLandingImages,
  getLandingImage,
  createLandingImage,
  updateLandingImage,
  deleteLandingImage,
} from './landing-image.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────
router.get('/', authorize('admin', 'owner'), listLandingImages);

router.post('/', authorize('admin', 'owner'), createLandingImage);

// ─── Rutas con :id ───────────────────────────────────────────────────────────
router.get('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  getLandingImage
);

router.patch('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  updateLandingImage
);

router.delete('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  deleteLandingImage
);

export { router as landingImageRouter };
