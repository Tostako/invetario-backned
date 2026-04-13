import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  softDeleteCategory,
  countProductsByCategory,
} from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';

// Toda la lógica de negocio vive aquí. El repositorio no sabe de reglas,
// el controller no sabe de validaciones de negocio.

// ─── HU12: Listar categorías ──────────────────────────────────────────────────
export const listCategoriesService = async (
  shopId: string,
  filter: CategoryFilter
): Promise<{ categorias: Category[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllCategories(shopId, filter);

  const meta: PaginationMeta = {
    total,
    page: filter.page,
    limit: filter.limit,
    totalPages: Math.ceil(total / filter.limit),
  };

  return { categorias: rows, meta };
};

// ─── HU12 (detalle): Obtener categoría por ID ─────────────────────────────────
export const getCategoryService = async (
  shopId: string,
  categoryId: string
): Promise<Category> => {
  const categoria = await findCategoryById(shopId, categoryId);
  if (!categoria) throw new NotFoundError('Category');
  return categoria;
};

// ─── HU11: Crear categoría ────────────────────────────────────────────────────
export const createCategoryService = async (
  shopId: string,
  dto: CreateCategoryDto
): Promise<Category> => {
  // Verificar nombre único dentro de la misma tienda y mismo padre
  const existente = await findCategoryByName(shopId, dto.name, dto.parent_id);
  if (existente) {
    throw new ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`);
  }

  return createCategory(shopId, dto);
};

// ─── HU13: Editar categoría ───────────────────────────────────────────────────
export const updateCategoryService = async (
  shopId: string,
  categoryId: string,
  dto: UpdateCategoryDto
): Promise<Category> => {
  // Verificar que la categoría existe y pertenece a esta tienda
  const existente = await findCategoryById(shopId, categoryId);
  if (!existente) throw new NotFoundError('Category');

  // Si se cambia el nombre, verificar que no esté ocupado por otra categoría
  if (dto.name) {
    const parentId = dto.parent_id !== undefined ? dto.parent_id : existente.parent_id;
    const conflicto = await findCategoryByName(shopId, dto.name, parentId, categoryId);
    if (conflicto) {
      throw new ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`);
    }
  }

  const actualizada = await updateCategory(shopId, categoryId, dto);
  if (!actualizada) throw new NotFoundError('Category');
  return actualizada;
};

// ─── HU14: Eliminar categoría ─────────────────────────────────────────────────
export const deleteCategoryService = async (
  shopId: string,
  categoryId: string
): Promise<void> => {
  const categoria = await findCategoryById(shopId, categoryId);
  if (!categoria) throw new NotFoundError('Category');

  // Bloquear eliminación si tiene productos activos asociados
  const totalProductos = await countProductsByCategory(shopId, categoryId);
  if (totalProductos > 0) {
    throw new ValidationError(
      `No se puede eliminar la categoría: tiene ${totalProductos} producto(s) asociado(s)`
    );
  }

  await softDeleteCategory(shopId, categoryId);
};
