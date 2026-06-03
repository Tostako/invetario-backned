import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/utils/response';
import { PublicProductFilterSchema } from '../products/product.types';
import { CategoryFilterSchema } from '../categories/category.types';
import {
  listProductsService,
  getProductService,
} from '../products/product.service';
import {
  listCategoriesService,
} from '../categories/category.service';
import { buscarIdsCategoriaActivaPorNombre } from '../categories/category.repository';
import { listPublicOffersService } from '../offers/offer.service';
import { listPublicSiteConfigsService } from '../site-config/site-config.service';
import { listPublicLandingImagesService } from '../landing-image/landing-image.service';
import { esUuidV4 } from '../../shared/utils/uuidV4';
import { ValidationError } from '../../shared/errors/AppError';

// ─── Productos Públicos ───────────────────────────────────────────────────────

export const listPublicProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = PublicProductFilterSchema.parse(req.query);
    let category_id = parsed.category_id;

    if (category_id) {
      if (!esUuidV4(category_id)) {
        const ids = await buscarIdsCategoriaActivaPorNombre(req.user.shop_id, category_id);
        if (ids.length === 0) {
          throw new ValidationError(
            `No hay categoría activa con el nombre "${category_id}". Usa el UUID de GET /api/v1/public/categories?shop_slug=... o el nombre exacto.`
          );
        }
        if (ids.length > 1) {
          throw new ValidationError(
            `Hay varias categorías activas con el nombre "${category_id}". Indica category_id como UUID (lista en GET /api/v1/public/categories).`
          );
        }
        category_id = ids[0]!;
      }
    }

    const publicFilter = { ...parsed, category_id, is_active: true };
    const { products, meta } = await listProductsService(req.user.shop_id, publicFilter);
    sendSuccess(res, products, 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getPublicProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await getProductService(req.user.shop_id, req.params['id']!);
    // Ocultar campos sensibles/internos del producto
    const { cost, stock, stock_min, stock_max, ...publicProduct } = product as unknown as Record<string, unknown>;
    sendSuccess(res, publicProduct);
  } catch (err) {
    next(err);
  }
};

// ─── Categorías Públicas ──────────────────────────────────────────────────────

export const listPublicCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = CategoryFilterSchema.parse(req.query);
    // Forzar is_active=true en el catálogo público
    const publicFilter = { ...filter, is_active: true };
    const { categorias, meta } = await listCategoriesService(req.user.shop_id, publicFilter);
    sendSuccess(res, categorias, 200, meta);
  } catch (err) {
    next(err);
  }
};

// ─── Ofertas Públicas ─────────────────────────────────────────────────────────

export const listPublicOffers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offers = await listPublicOffersService(req.user.shop_id);
    sendSuccess(res, offers);
  } catch (err) {
    next(err);
  }
};

// ─── Site Config Público ─────────────────────────────────────────────────────

export const listPublicSiteConfigs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const configs = await listPublicSiteConfigsService(req.user.shop_id);
    sendSuccess(res, configs);
  } catch (err) {
    next(err);
  }
};

// ─── Landing Images Público ──────────────────────────────────────────────────

export const listPublicLandingImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const images = await listPublicLandingImagesService(req.user.shop_id);
    sendSuccess(res, images);
  } catch (err) {
    next(err);
  }
};
