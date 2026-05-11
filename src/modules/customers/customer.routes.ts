import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from './customer.controller';

const router = Router();

router.use(authenticate, tenantGuard);

router.get('/', authorize('staff', 'admin', 'owner'), listarClientes);

router.get('/:id',
  authorize('staff', 'admin', 'owner'),
  validateUuid('id'),
  obtenerCliente
);

router.post('/',
  authorize('admin', 'owner'),
  crearCliente
);

router.patch('/:id',
  authorize('admin', 'owner'),
  validateUuid('id'),
  actualizarCliente
);

router.delete('/:id',
  authorize('admin', 'owner'),
  validateUuid('id'),
  eliminarCliente
);

export { router as customerRouter };
