import { query } from '../../config/database';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFilter, Category } from './category.types';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface FindAllResult {
  rows: Category[];
  total: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────
// REGLA: shop_id es el PRIMER parámetro en todos los filtros WHERE.
// Nunca se puede leer una categoría sin conocer el tenant.

export const findAllCategories = async (
  shopId: string,
  filter: CategoryFilter
): Promise<FindAllResult> => {
  const conditions: string[] = ['shop_id = $1'];
  const params: unknown[] = [shopId];
  let idx = 2;

  if (filter.is_active !== undefined) {
    conditions.push(`is_active = $${idx}`);
    params.push(filter.is_active);
    idx++;
  }

  const where = conditions.join(' AND ');
  const offset = (filter.page - 1) * filter.limit;

  const result = await query<Category & { total_count: string }>(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM categories
     WHERE ${where}
     ORDER BY name ASC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, filter.limit, offset]
  );

  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findCategoryById = async (
  shopId: string,
  categoryId: string
): Promise<Category | null> => {
  const result = await query<Category>(
    `SELECT * FROM categories
     WHERE id = $1 AND shop_id = $2`,
    [categoryId, shopId]
  );
  return result.rows[0] ?? null;
};

export const findCategoryByName = async (
  shopId: string,
  name: string,
  parentId?: string | null,
  excludeId?: string
): Promise<Category | null> => {
  const params: unknown[] = [name, shopId];
  let queryStr: string;

  if (parentId) {
    queryStr = 'SELECT id FROM categories WHERE name = $1 AND shop_id = $2 AND parent_id = $3';
    params.push(parentId);
  } else {
    queryStr = 'SELECT id FROM categories WHERE name = $1 AND shop_id = $2 AND parent_id IS NULL';
  }

  if (excludeId) {
    queryStr += ` AND id != $${params.length + 1}`;
    params.push(excludeId);
  }

  const result = await query<Category>(queryStr, params);
  return result.rows[0] ?? null;
};

export const createCategory = async (
  shopId: string,
  dto: CreateCategoryDto
): Promise<Category> => {
  const result = await query<Category>(
    `INSERT INTO categories (shop_id, name, description, is_active, parent_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      shopId,
      dto.name,
      dto.description ?? null,
      dto.is_active,
      dto.parent_id ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateCategory = async (
  shopId: string,
  categoryId: string,
  dto: UpdateCategoryDto
): Promise<Category | null> => {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const allowed: (keyof UpdateCategoryDto)[] = ['name', 'description', 'is_active', 'parent_id'];

  for (const key of allowed) {
    if (dto[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      params.push(dto[key]);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  params.push(categoryId, shopId);

  const result = await query<Category>(
    `UPDATE categories
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND shop_id = $${idx + 1}
     RETURNING *`,
    params
  );
  return result.rows[0] ?? null;
};

// Soft delete — conserva el registro para historial y productos asociados
export const softDeleteCategory = async (
  shopId: string,
  categoryId: string
): Promise<boolean> => {
  const result = await query(
    `UPDATE categories SET is_active = FALSE
     WHERE id = $1 AND shop_id = $2`,
    [categoryId, shopId]
  );
  return (result.rowCount ?? 0) > 0;
};

// Verifica si la categoría tiene productos activos asociados (bloquea el delete)
export const countProductsByCategory = async (
  shopId: string,
  categoryId: string
): Promise<number> => {
  const result = await query<{ total: string }>(
    `SELECT COUNT(*) AS total
     FROM products
     WHERE category_id = $1 AND shop_id = $2 AND is_active = TRUE`,
    [categoryId, shopId]
  );
  return parseInt(result.rows[0]?.total ?? '0');
};
