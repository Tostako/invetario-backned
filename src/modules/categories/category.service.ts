// ─── Categories Service ───────────────────────────────────────────────────────
// Database-Centric: validaciones de unicidad de nombre y bloqueo por
// productos activos ocurren en la BD (18_fn_categories.sql).
// El servicio traduce errores de BD y formatea la paginación.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
  actualizarImagenCategoria,
} from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';
import { supabase } from '../../config/supabase';
import path from 'path';

export const listCategoriesService = async (
  shopId: string,
  filter: CategoryFilter
): Promise<{ categorias: Category[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllCategories(shopId, filter);
  return {
    categorias: rows,
    meta: {
      total,
      page:       filter.page,
      limit:      filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getCategoryService = async (
  shopId: string,
  categoryId: string
): Promise<Category> => {
  const categoria = await findCategoryById(shopId, categoryId);
  if (!categoria) throw new NotFoundError('Categoría');
  return categoria;
};

export const createCategoryService = async (
  shopId: string,
  dto: CreateCategoryDto
): Promise<Category> => {
  try {
    return await createCategory(shopId, dto);
  } catch (err) {
    throw traducirErrorDB(err, {
      CATEGORIA_NOMBRE_DUPLICADO: () =>
        new ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`),
    });
  }
};

export const updateCategoryService = async (
  shopId: string,
  categoryId: string,
  dto: UpdateCategoryDto
): Promise<Category> => {
  try {
    const actualizada = await updateCategory(shopId, categoryId, dto);
    if (!actualizada) throw new NotFoundError('Categoría');
    return actualizada;
  } catch (err) {
    throw traducirErrorDB(err, {
      CATEGORY_NOT_FOUND: () => new NotFoundError('Categoría'),
      CATEGORIA_NOMBRE_DUPLICADO: () =>
        new ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`),
    });
  }
};

export const subirImagenCategoriaService = async (
  shopId: string,
  categoryId: string,
  file: Express.Multer.File
): Promise<Category> => {
  const fileName = `${shopId}/${Date.now()}-${path.basename(file.originalname)}`;

  const { data, error } = await supabase.storage
    .from('category-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage error: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from('category-images')
    .getPublicUrl(data.path);

  const categoria = await actualizarImagenCategoria(shopId, categoryId, publicData.publicUrl);
  if (!categoria) throw new NotFoundError('Categoría');
  return categoria;
};

export const deleteCategoryService = async (
  shopId: string,
  categoryId: string
): Promise<void> => {
  try {
    await softDeleteCategory(shopId, categoryId);
  } catch (err) {
    throw traducirErrorDB(err, {
      CATEGORY_NOT_FOUND: () => new NotFoundError('Categoría'),
      CATEGORIA_CON_PRODUCTOS: (msg: string) => {
        const total = msg.split(':')[1];
        return new ValidationError(
          `No se puede eliminar la categoría: tiene ${total} producto(s) asociado(s)`
        );
      },
    });
  }
};
