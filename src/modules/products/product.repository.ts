// ─── Products Repository ─────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/17_fn_products.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateProductDto, UpdateProductDto, ProductFilter, Product } from './product.types';

interface FindAllResult {
  rows: Product[];
  total: number;
}

export const findAllProducts = async (
  shopId: string,
  filter: ProductFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<Product & { total_count: string }>(
    `SELECT * FROM fn_listar_productos($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      shopId,
      filter.search ?? null,
      filter.category_id ?? null,
      filter.supplier_id ?? null,
      filter.low_stock ?? false,
      filter.is_active ?? true,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findProductById = async (
  shopId: string,
  productId: string
): Promise<Product | null> => {
  const result = await query<Product>(
    `SELECT * FROM fn_obtener_producto($1, $2)`,
    [shopId, productId]
  );
  return result.rows[0] ?? null;
};

export const createProduct = async (
  shopId: string,
  dto: CreateProductDto
): Promise<Product> => {
  const result = await query<Product>(
    `SELECT * FROM sp_crear_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      shopId,
      dto.sku,
      dto.name,
      dto.price,
      dto.stock,
      dto.stock_min,
      dto.description ?? null,
      dto.image_url ?? null,
      dto.category_id ?? null,
      dto.supplier_id ?? null,
      dto.cost ?? null,
      dto.stock_max ?? null,
      dto.unit,
    ]
  );
  return result.rows[0]!;
};

export const updateProduct = async (
  shopId: string,
  productId: string,
  dto: UpdateProductDto
): Promise<Product | null> => {
  const result = await query<Product>(
    `SELECT * FROM sp_actualizar_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      shopId,
      productId,
      dto.sku ?? null,
      dto.name ?? null,
      dto.description ?? null,
      dto.image_url ?? null,
      dto.category_id ?? null,
      dto.supplier_id ?? null,
      dto.price ?? null,
      dto.cost ?? null,
      dto.stock ?? null,
      dto.stock_min ?? null,
      dto.stock_max ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const softDeleteProduct = async (
  shopId: string,
  productId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_producto($1, $2)`, [shopId, productId]);
  return true;
};

export const adjustStock = async (
  shopId: string,
  productId: string,
  delta: number,
  userId: string,
  tipo: string = 'adjustment',
  orderId?: string,
  notas?: string
): Promise<Product | null> => {
  const result = await query<Product>(
    `SELECT * FROM sp_ajustar_stock($1, $2, $3, $4, $5, $6, $7)`,
    [shopId, productId, delta, userId, tipo, orderId ?? null, notas ?? null]
  );
  return result.rows[0] ?? null;
};
