import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  crearPedido,
  listarPedidos,
  obtenerPedido,
  actualizarEstado,
} from './order.controller';

const router = Router();

router.use(authenticate, tenantGuard);

// HU8 – Finalizar compra (cualquier rol autenticado)
router.post('/', crearPedido);

// HU9 – Listar pedidos (admin y owner)
router.get('/', authorize('admin', 'owner'), listarPedidos);

// Detalle de un pedido
router.get('/:id', validateUuid('id'), obtenerPedido);

// HU10 – Actualizar estado (solo admin y owner)
router.patch('/:id/estado',
  validateUuid('id'),
  authorize('admin', 'owner'),
  actualizarEstado
);

export { router as orderRouter };
