import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import { verCarrito, agregarItem, actualizarItem, eliminarItem } from './cart.controller';

// Carrito disponible para todos los roles autenticados (owner, admin, staff)
const router = Router();

router.use(authenticate, tenantGuard);

// HU7 – Ver carrito
router.get('/', verCarrito);

// HU6 – Agregar ítem
router.post('/items', agregarItem);

// HU7 – Actualizar cantidad
router.patch('/items/:id', validateUuid('id'), actualizarItem);

// HU7 – Eliminar ítem
router.delete('/items/:id', validateUuid('id'), eliminarItem);

export { router as cartRouter };
