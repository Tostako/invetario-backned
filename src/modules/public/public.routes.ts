import { Router } from 'express';
import { publicShopResolver } from '../../middlewares/publicShopResolver';
import { validateUuid } from '../../middlewares/validateUuid';
import {
  listPublicProducts,
  getPublicProduct,
  listPublicCategories,
} from './public.controller';

const router = Router();

// TODAS las rutas públicas requieren resolver la tienda por shop_slug
router.use(publicShopResolver);

// ─── Productos públicos ───────────────────────────────────────────────────────
router.get('/products', listPublicProducts);
router.get('/products/:id', validateUuid('id'), getPublicProduct);

// ─── Categorías públicas ──────────────────────────────────────────────────────
router.get('/categories', listPublicCategories);

export { router as publicRouter };
