import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  loginSuperAdmin,
  bootstrapSuperAdmin,
  registrarSuperAdmin,
  listarTiendas,
  obtenerTienda,
  crearTienda,
  actualizarTienda,
  eliminarTienda,
} from './superadmin.controller';

const router = Router();

// ─── Auth de superadmin ───────────────────────────────────────────────────────

// POST /api/v1/admin/auth/login
router.post('/auth/login', loginSuperAdmin);

// POST /api/v1/admin/auth/bootstrap  — solo funciona si NO hay superadmins aún
router.post('/auth/bootstrap', bootstrapSuperAdmin);

// POST /api/v1/admin/auth/register  — requiere ser superadmin activo
router.post('/auth/register', authenticate, authorize('superadmin'), registrarSuperAdmin);

// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────
// Todas estas rutas requieren token de superadmin

router.use(authenticate, authorize('superadmin'));

// GET    /api/v1/admin/shops
router.get('/shops', listarTiendas);

// POST   /api/v1/admin/shops
router.post('/shops', crearTienda);

// GET    /api/v1/admin/shops/:id
router.get('/shops/:id', validateUuid('id'), obtenerTienda);

// PATCH  /api/v1/admin/shops/:id
router.patch('/shops/:id', validateUuid('id'), actualizarTienda);

// DELETE /api/v1/admin/shops/:id  (soft delete)
router.delete('/shops/:id', validateUuid('id'), eliminarTienda);

export { router as superAdminRouter };
