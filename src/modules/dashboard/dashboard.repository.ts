import { query } from '../../config/database';
import {
  ResumenDashboard,
  IngresosMes,
  PedidosMes,
  VentaDiaSemana,
  EstadoPedidosFila,
  ProductoTop,
  TopProductsQuery,
} from './dashboard.types';

const condicionIngresos = `status != 'cancelled'`;

export const obtenerIngresosMes = async (shopId: string): Promise<number> => {
  const r = await query<{ sum: string | null }>(
    `SELECT COALESCE(SUM(total), 0)::text AS sum
     FROM orders
     WHERE shop_id = $1
       AND ${condicionIngresos}
       AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
       AND created_at < date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'`,
    [shopId]
  );
  return parseFloat(r.rows[0]?.sum ?? '0');
};

export const obtenerPedidosMes = async (shopId: string): Promise<number> => {
  const r = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM orders
     WHERE shop_id = $1
       AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
       AND created_at < date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'`,
    [shopId]
  );
  return parseInt(r.rows[0]!.count, 10);
};

export const obtenerResumenDashboard = async (shopId: string): Promise<ResumenDashboard> => {
  const [
    totalPedidos,
    totalVentas,
    totalProductos,
    alertasStock,
    clientesNuevos,
    pedidosMes,
    ingresosMes,
  ] = await Promise.all([
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM orders WHERE shop_id = $1`,
      [shopId]
    ),
    query<{ s: string | null }>(
      `SELECT COALESCE(SUM(total), 0)::text AS s
       FROM orders WHERE shop_id = $1 AND ${condicionIngresos}`,
      [shopId]
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM products WHERE shop_id = $1 AND is_active = TRUE`,
      [shopId]
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM products
       WHERE shop_id = $1 AND is_active = TRUE AND stock <= stock_min`,
      [shopId]
    ),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM customers
       WHERE shop_id = $1
         AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
         AND created_at < date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'`,
      [shopId]
    ),
    obtenerPedidosMes(shopId),
    obtenerIngresosMes(shopId),
  ]);

  return {
    total_pedidos:       parseInt(totalPedidos.rows[0]!.c, 10),
    total_ventas:        parseFloat(totalVentas.rows[0]?.s ?? '0'),
    total_productos_activos: parseInt(totalProductos.rows[0]!.c, 10),
    alertas_stock:       parseInt(alertasStock.rows[0]!.c, 10),
    clientes_nuevos_mes: parseInt(clientesNuevos.rows[0]!.c, 10),
    pedidos_mes:         pedidosMes,
    ingresos_mes:        ingresosMes,
  };
};

export const obtenerIngresosMesConMeta = async (shopId: string): Promise<IngresosMes> => {
  const ingresos = await obtenerIngresosMes(shopId);
  const r = await query<{ mes: string }>(
    `SELECT to_char(date_trunc('month', CURRENT_TIMESTAMP), 'YYYY-MM') AS mes`
  );
  return { ingresos_mes: ingresos, mes: r.rows[0]!.mes };
};

export const obtenerPedidosMesConMeta = async (shopId: string): Promise<PedidosMes> => {
  const pedidos = await obtenerPedidosMes(shopId);
  const r = await query<{ mes: string }>(
    `SELECT to_char(date_trunc('month', CURRENT_TIMESTAMP), 'YYYY-MM') AS mes`
  );
  return { pedidos_mes: pedidos, mes: r.rows[0]!.mes };
};

/** Lunes a domingo de la semana ISO (date_trunc('week') en PostgreSQL comienza en lunes). */
export const obtenerVentasSemana = async (shopId: string): Promise<VentaDiaSemana[]> => {
  const r = await query<{
    fecha: Date;
    dia_semana: number;
    nombre_dia: string;
    ventas: string | null;
    pedidos: string | null;
  }>(
    `WITH semana AS (
       SELECT generate_series(
         date_trunc('week', CURRENT_DATE)::date,
         (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
         interval '1 day'
       )::date AS dia
     )
     SELECT
       s.dia AS fecha,
       EXTRACT(ISODOW FROM s.dia)::int AS dia_semana,
       trim(to_char(s.dia, 'Day')) AS nombre_dia,
       COALESCE(SUM(o.total), 0)::text AS ventas,
       COUNT(o.id)::text AS pedidos
     FROM semana s
     LEFT JOIN orders o
       ON o.shop_id = $1
       AND o.status != 'cancelled'
       AND (o.created_at::date) = s.dia
     GROUP BY s.dia
     ORDER BY s.dia`,
    [shopId]
  );

  return r.rows.map((row) => ({
    fecha:       row.fecha instanceof Date ? row.fecha.toISOString().slice(0, 10) : String(row.fecha),
    dia_semana:  row.dia_semana,
    nombre_dia:  row.nombre_dia,
    ventas:      parseFloat(row.ventas ?? '0'),
    pedidos:     parseInt(row.pedidos ?? '0', 10),
  }));
};

export const obtenerPedidosPorEstado = async (shopId: string): Promise<EstadoPedidosFila[]> => {
  const r = await query<{ status: string; total: string }>(
    `SELECT status, COUNT(*)::text AS total
     FROM orders
     WHERE shop_id = $1
     GROUP BY status`,
    [shopId]
  );

  const estados = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const mapa = new Map(r.rows.map((x) => [x.status, parseInt(x.total, 10)]));
  return estados.map((status) => ({
    status,
    total: mapa.get(status) ?? 0,
  }));
};

export const obtenerProductosTop = async (
  shopId: string,
  q: TopProductsQuery
): Promise<ProductoTop[]> => {
  const sqlOrdenIngresos = `SELECT
       oi.product_id,
       p.sku,
       p.name,
       SUM(oi.quantity)::text AS unidades_vendidas,
       SUM(oi.subtotal)::text AS ingresos_generados
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id AND o.shop_id = oi.shop_id
     INNER JOIN products p ON p.id = oi.product_id AND p.shop_id = oi.shop_id
     WHERE oi.shop_id = $1
       AND o.status != 'cancelled'
     GROUP BY oi.product_id, p.sku, p.name
     ORDER BY SUM(oi.subtotal) DESC, SUM(oi.quantity) DESC
     LIMIT $2`;

  const sqlOrdenUnidades = `SELECT
       oi.product_id,
       p.sku,
       p.name,
       SUM(oi.quantity)::text AS unidades_vendidas,
       SUM(oi.subtotal)::text AS ingresos_generados
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id AND o.shop_id = oi.shop_id
     INNER JOIN products p ON p.id = oi.product_id AND p.shop_id = oi.shop_id
     WHERE oi.shop_id = $1
       AND o.status != 'cancelled'
     GROUP BY oi.product_id, p.sku, p.name
     ORDER BY SUM(oi.quantity) DESC, SUM(oi.subtotal) DESC
     LIMIT $2`;

  const r = await query<{
    product_id: string;
    sku: string;
    name: string;
    unidades_vendidas: string;
    ingresos_generados: string;
  }>(q.orden === 'ingresos' ? sqlOrdenIngresos : sqlOrdenUnidades, [shopId, q.limite]);

  return r.rows.map((row) => ({
    product_id:         row.product_id,
    sku:                row.sku,
    name:               row.name,
    unidades_vendidas:  parseInt(row.unidades_vendidas, 10),
    ingresos_generados: parseFloat(row.ingresos_generados),
  }));
};
