import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { validateUuid } from '../../middlewares/validateUuid';
import { upload } from '../../middlewares/upload';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  subirImagenCategoria,
} from './category.controller';

// Cadena de seguridad por capa:
//   1. authenticate  → JWT válido + extrae shop_id
//   2. tenantGuard   → shop existe y está activa en DB
//   3. authorize     → rol suficiente para la operación
//   4. validateUuid  → :id es UUID bien formado antes de llegar al controller

const router = Router();

// Los dos primeros middlewares aplican a TODO el módulo
router.use(authenticate, tenantGuard);

// ─── Rutas sin parámetro :id ──────────────────────────────────────────────────

// HU12: Listar categorías — cualquier usuario autenticado
router.get('/', listCategories);

// HU11: Crear categoría — solo admin u owner
router.post('/',
  authorize('admin', 'owner'),
  createCategory
);

// ─── Rutas con :id ───────────────────────────────────────────────────────────

// HU12 (detalle): Obtener categoría — cualquier usuario autenticado
router.get('/:id',
  validateUuid('id'),
  getCategory
);

// HU13: Editar categoría — solo admin u owner
router.patch('/:id',
  validateUuid('id'),
  authorize('admin', 'owner'),
  upload.single('image'),
  updateCategory
);

// Subir imagen de categoría
router.patch(
  '/:id/image',
  validateUuid('id'),
  authorize('admin', 'owner'),
  upload.single('image'),
  subirImagenCategoria
);

// HU14: Eliminar categoría — solo owner
router.delete('/:id',
  validateUuid('id'),
  authorize('owner'),
  deleteCategory
);

export { router as categoryRouter };
