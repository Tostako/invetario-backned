import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { requireShopStaff } from '../../middlewares/requireShopStaff';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  obtenerPreferencias,
  actualizarPreferencias,
  listarSesiones,
  eliminarSesion,
  setup2fa,
  enable2fa,
  disable2fa,
} from './user.controller';

const router = Router();

router.use(authenticate, tenantGuard, requireShopStaff);

router.get('/me', obtenerPerfil);
router.patch('/me', actualizarPerfil);
router.patch('/me/password', cambiarPassword);

router.get('/notifications', obtenerPreferencias);
router.patch('/notifications', actualizarPreferencias);

router.get('/sessions', listarSesiones);
router.delete('/sessions/:sessionId', validateUuid('sessionId'), eliminarSesion);

router.post('/me/2fa/setup', setup2fa);
router.post('/me/2fa/enable', enable2fa);
router.post('/me/2fa/disable', disable2fa);

export { router as userRouter };
