import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CategoryFilterSchema,
} from './category.types';
import {
  listCategoriesService,
  getCategoryService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from './category.service';

// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.

// ─── HU12: Listar categorías ──────────────────────────────────────────────────
export const listCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter = CategoryFilterSchema.parse(req.query);
    const { categorias, meta } = await listCategoriesService(req.user.shop_id, filter);
    sendSuccess(res, categorias, 200, meta);
  } catch (err) {
    next(err);
  }
};

// ─── HU12 (detalle): Obtener categoría por ID ─────────────────────────────────
export const getCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoria = await getCategoryService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, categoria);
  } catch (err) {
    next(err);
  }
};

// ─── HU11: Crear categoría ────────────────────────────────────────────────────
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = CreateCategorySchema.parse(req.body);
    const categoria = await createCategoryService(req.user.shop_id, dto);
    sendCreated(res, categoria);
  } catch (err) {
    next(err);
  }
};

// ─── HU13: Editar categoría ───────────────────────────────────────────────────
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = UpdateCategorySchema.parse(req.body);
    const categoria = await updateCategoryService(req.user.shop_id, req.params['id']!, dto);
    sendSuccess(res, categoria);
  } catch (err) {
    next(err);
  }
};

// ─── HU14: Eliminar categoría ─────────────────────────────────────────────────
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteCategoryService(req.user.shop_id, req.params['id']!);
    sendSuccess(res, { message: 'Categoría desactivada correctamente' });
  } catch (err) {
    next(err);
  }
};
