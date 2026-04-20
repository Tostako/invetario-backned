// ─── Categories Repository ────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Funciones definidas en: database/18_fn_categories.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';

interface FindAllResult {
  rows: Category[];
  total: number;
}

export const findAllCategories = async (
  shopId: string,
  filter: CategoryFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<Category & { total_count: string }>(
    `SELECT * FROM fn_listar_categorias($1, $2, $3, $4)`,
    [shopId, filter.is_active ?? null, filter.limit, offset]
  );
  return {
    rows:  result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findCategoryById = async (
  shopId: string,
  categoryId: string
): Promise<Category | null> => {
  const result = await query<Category>(
    `SELECT * FROM fn_obtener_categoria($1, $2)`,
    [shopId, categoryId]
  );
  return result.rows[0] ?? null;
};

export const createCategory = async (
  shopId: string,
  dto: CreateCategoryDto
): Promise<Category> => {
  const result = await query<Category>(
    `SELECT * FROM sp_crear_categoria($1, $2, $3, $4, $5)`,
    [shopId, dto.name, dto.description ?? null, dto.is_active, dto.parent_id ?? null]
  );
  return result.rows[0]!;
};

export const updateCategory = async (
  shopId: string,
  categoryId: string,
  dto: UpdateCategoryDto
): Promise<Category | null> => {
  const result = await query<Category>(
    `SELECT * FROM sp_actualizar_categoria($1, $2, $3, $4, $5, $6)`,
    [
      shopId,
      categoryId,
      dto.name        ?? null,
      dto.description ?? null,
      dto.is_active   ?? null,
      dto.parent_id   ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const softDeleteCategory = async (
  shopId: string,
  categoryId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_categoria($1, $2)`, [shopId, categoryId]);
  return true;
};

export const countProductsByCategory = async (
  shopId: string,
  categoryId: string
): Promise<number> => {
  const result = await query<{ fn_contar_productos_categoria: string }>(
    `SELECT fn_contar_productos_categoria($1, $2)`,
    [shopId, categoryId]
  );
  return parseInt(result.rows[0]!.fn_contar_productos_categoria ?? '0');
};
