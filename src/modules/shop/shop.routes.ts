import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { requireShopStaff } from '../../middlewares/requireShopStaff';
import { obtenerTienda, actualizarTienda, eliminarTienda, subirLogoTienda } from './shop.controller';
import { upload } from '../../middlewares/upload';

const router = Router();

router.use(authenticate, tenantGuard, requireShopStaff);

router.get('/', obtenerTienda);
router.patch('/', authorize('admin', 'owner'), actualizarTienda);
router.patch('/logo', authorize('admin', 'owner'), upload.single('logo'), subirLogoTienda);
router.delete('/', authorize('owner'), eliminarTienda);

export { router as shopRouter };
