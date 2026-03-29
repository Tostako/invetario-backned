import { query } from '../../config/database';
import { CreateProductDto, UpdateProductDto, ProductFilter, Product } from './product.types';

// ─── Tipos internos de la capa de repositorio ─────────────────────────────────

interface FindAllResult {
  rows: Product[];
  total: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────
// REGLA: shop_id es el PRIMER parámetro en todos los filtros WHERE.
// Nunca se puede leer un producto sin conocer el tenant.

export const findAllProducts = async (
  shopId: string,
  filter: ProductFilter
): Promise<FindAllResult> => {
  const conditions: string[] = ['p.shop_id = $1', 'p.is_active = TRUE'];
  const params: unknown[] = [shopId];
  let idx = 2;

  if (filter.search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`);
    params.push(`%${filter.search}%`);
    idx++;
  }

  if (filter.category_id) {
    conditions.push(`p.category_id = $${idx}`);
    params.push(filter.category_id);
    idx++;
  }

  if (filter.supplier_id) {
    conditions.push(`p.supplier_id = $${idx}`);
    params.push(filter.supplier_id);
    idx++;
  }

  if (filter.low_stock) {
    conditions.push('p.stock <= p.stock_min');
  }

  if (filter.is_active !== undefined) {
    conditions.push(`p.is_active = $${idx}`);
    params.push(filter.is_active);
    idx++;
  }

  const where = conditions.join(' AND ');
  const offset = (filter.page - 1) * filter.limit;

  // Obtener total y filas en una sola query usando COUNT como window function
  const result = await query<Product & { total_count: string }>(
    `SELECT
       p.*,
       c.name   AS category_name,
       s.name   AS supplier_name,
       COUNT(*) OVER() AS total_count
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
     LEFT JOIN suppliers  s ON s.id = p.supplier_id  AND s.shop_id = p.shop_id
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, filter.limit, offset]
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
    `SELECT
       p.*,
       c.name AS category_name,
       s.name AS supplier_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
     LEFT JOIN suppliers  s ON s.id = p.supplier_id  AND s.shop_id = p.shop_id
     WHERE p.id = $1 AND p.shop_id = $2`,
    [productId, shopId]
  );
  return result.rows[0] ?? null;
};

export const findProductBySku = async (
  shopId: string,
  sku: string,
  excludeId?: string
): Promise<Product | null> => {
  const params: unknown[] = [sku.toUpperCase(), shopId];
  let query_str = 'SELECT id FROM products WHERE sku = $1 AND shop_id = $2';

  if (excludeId) {
    query_str += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await query<Product>(query_str, params);
  return result.rows[0] ?? null;
};

export const createProduct = async (
  shopId: string,
  dto: CreateProductDto
): Promise<Product> => {
  const result = await query<Product>(
    `INSERT INTO products
       (shop_id, sku, name, description, image_url, category_id, supplier_id,
        price, cost, stock, stock_min, stock_max, unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      shopId,
      dto.sku.toUpperCase(),
      dto.name,
      dto.description ?? null,
      dto.image_url ?? null,
      dto.category_id ?? null,
      dto.supplier_id ?? null,
      dto.price,
      dto.cost ?? null,
      dto.stock,
      dto.stock_min,
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
  // Construye SET dinámico — solo actualiza los campos enviados
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  const allowed: (keyof UpdateProductDto)[] = [
    'sku', 'name', 'description', 'image_url', 'category_id',
    'supplier_id', 'price', 'cost', 'stock', 'stock_min', 'stock_max', 'unit',
  ];

  for (const key of allowed) {
    if (dto[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      params.push(key === 'sku' ? (dto[key] as string).toUpperCase() : dto[key]);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  // shop_id y productId van al final del array de params
  params.push(productId, shopId);

  const result = await query<Product>(
    `UPDATE products
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND shop_id = $${idx + 1}
     RETURNING *`,
    params
  );
  return result.rows[0] ?? null;
};

// Soft delete — nunca borrar físicamente para preservar historial en order_items
export const softDeleteProduct = async (
  shopId: string,
  productId: string
): Promise<boolean> => {
  const result = await query(
    `UPDATE products SET is_active = FALSE
     WHERE id = $1 AND shop_id = $2`,
    [productId, shopId]
  );
  return (result.rowCount ?? 0) > 0;
};

// Ajuste de stock atómico — para venta, compra y ajustes manuales
export const adjustStock = async (
  shopId: string,
  productId: string,
  delta: number  // positivo = entrada, negativo = salida
): Promise<Product | null> => {
  const result = await query<Product>(
    `UPDATE products
     SET stock = stock + $1
     WHERE id = $2 AND shop_id = $3 AND (stock + $1) >= 0
     RETURNING *`,
    [delta, productId, shopId]
  );
  return result.rows[0] ?? null;
};
