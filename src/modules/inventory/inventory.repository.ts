import { query } from '../../config/database';
import { MovimientosFilter, MovimientoInventario, AlertaInventario } from './inventory.types';

export const listarAlertasInventario = async (shopId: string): Promise<AlertaInventario[]> => {
  const r = await query<{
    product_id: string;
    sku: string;
    name: string;
    stock: number;
    stock_min: number;
    stock_max: number | null;
    image_url: string | null;
    is_active: boolean;
    tipo_alerta: string;
  }>(
    `SELECT
       p.id AS product_id,
       p.sku,
       p.name,
       p.stock,
       p.stock_min,
       p.stock_max,
       p.image_url,
       p.is_active,
       CASE
         WHEN p.stock <= 0 THEN 'sin_stock'
         ELSE 'stock_bajo'
       END AS tipo_alerta
     FROM products p
     WHERE p.shop_id = $1
       AND p.is_active = TRUE
       AND (p.stock <= 0 OR p.stock <= p.stock_min)
     ORDER BY
       CASE WHEN p.stock <= 0 THEN 0 ELSE 1 END,
       p.stock ASC,
       p.name ASC`,
    [shopId]
  );

  return r.rows.map((row) => ({
    ...row,
    tipo_alerta: row.tipo_alerta as 'sin_stock' | 'stock_bajo',
  }));
};

export const listarMovimientos = async (
  shopId: string,
  filtro: MovimientosFilter
): Promise<{ rows: MovimientoInventario[]; total: number }> => {
  const condiciones: string[] = ['m.shop_id = $1'];
  const params: unknown[] = [shopId];
  let i = 2;

  if (filtro.product_id) {
    condiciones.push(`m.product_id = $${i++}`);
    params.push(filtro.product_id);
  }
  if (filtro.type) {
    condiciones.push(`m.type = $${i++}`);
    params.push(filtro.type);
  }
  if (filtro.desde) {
    condiciones.push(`m.created_at >= $${i++}`);
    params.push(filtro.desde);
  }
  if (filtro.hasta) {
    const hastaFin = new Date(filtro.hasta);
    hastaFin.setHours(23, 59, 59, 999);
    condiciones.push(`m.created_at <= $${i++}`);
    params.push(hastaFin);
  }

  const whereSql = condiciones.join(' AND ');
  const offset = (filtro.page - 1) * filtro.limit;

  const countR = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c
     FROM inventory_movements m
     WHERE ${whereSql}`,
    params
  );
  const total = parseInt(countR.rows[0]!.c, 10);

  params.push(filtro.limit, offset);
  const lim = i;
  const off = i + 1;

  const r = await query<{
    id: string;
    shop_id: string;
    product_id: string;
    user_id: string;
    order_id: string | null;
    type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    notes: string | null;
    created_at: Date;
    product_name: string;
    product_sku: string;
  }>(
    `SELECT
       m.id,
       m.shop_id,
       m.product_id,
       m.user_id,
       m.order_id,
       m.type,
       m.quantity,
       m.stock_before,
       m.stock_after,
       m.notes,
       m.created_at,
       p.name AS product_name,
       p.sku AS product_sku
     FROM inventory_movements m
     INNER JOIN products p ON p.id = m.product_id AND p.shop_id = m.shop_id
     WHERE ${whereSql}
     ORDER BY m.created_at DESC
     LIMIT $${lim} OFFSET $${off}`,
    params
  );

  const rows: MovimientoInventario[] = r.rows.map((row) => ({
    ...row,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));

  return { rows, total };
};
