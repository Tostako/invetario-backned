// ─── Orders Repository ────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// La transacción de checkout (validar → crear → ajustar stock → vaciar carrito)
// y la máquina de estados viven en: database/20_fn_orders.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { Order, OrderItem, FiltrosPedido, EstadoPedido } from './order.types';

interface FindAllResult {
  rows:  Order[];
  total: number;
}

interface ItemParaInsertar {
  product_id: string;
  quantity:   number;
  unit_price: number;
  discount:   number;
  subtotal:   number;
}

interface CrearPedidoParams {
  shopId:      string;
  userId:      string;
  customerId:  string | null;
  items:       Array<{ product_id: string; quantity: number; discount: number }>;
  notes:       string | null;
}

// ─── Crear pedido — delegado completamente a la BD ───────────────────────────

export const crearOrden = async (
  params: CrearPedidoParams
): Promise<{ id: string; order_number: string; total: number }> => {
  const result = await query<{ order_id: string; order_number: string; total: string }>(
    `SELECT * FROM sp_crear_pedido($1, $2, $3, $4::jsonb, $5)`,
    [
      params.shopId,
      params.userId,
      params.customerId,
      JSON.stringify(params.items),
      params.notes,
    ]
  );
  const row = result.rows[0]!;
  return { id: row.order_id, order_number: row.order_number, total: parseFloat(row.total) };
};

// ─── Listar pedidos ───────────────────────────────────────────────────────────

export const findAllOrders = async (
  shopId: string,
  filtros: FiltrosPedido
): Promise<FindAllResult> => {
  const offset = (filtros.page - 1) * filtros.limit;
  const result = await query<Order & { total_count: string }>(
    `SELECT * FROM fn_listar_pedidos($1, $2, $3, $4, $5, $6, $7)`,
    [
      shopId,
      filtros.status      ?? null,
      filtros.customer_id ?? null,
      filtros.desde       ?? null,
      filtros.hasta       ?? null,
      filtros.limit,
      offset,
    ]
  );
  return {
    rows:  result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

// ─── Obtener pedido con sus ítems ─────────────────────────────────────────────

export const findOrderById = async (
  shopId: string,
  orderId: string
): Promise<Order | null> => {
  const [orderResult, itemsResult] = await Promise.all([
    query<Order>(`SELECT * FROM fn_obtener_pedido($1, $2)`, [shopId, orderId]),
    query<OrderItem>(`SELECT * FROM fn_listar_items_pedido($1, $2)`, [shopId, orderId]),
  ]);

  const orden = orderResult.rows[0];
  if (!orden) return null;

  orden.items = itemsResult.rows;
  return orden;
};

// ─── Actualizar estado ────────────────────────────────────────────────────────

export const updateOrderStatus = async (
  shopId: string,
  orderId: string,
  status: EstadoPedido,
  notes?: string
): Promise<Order | null> => {
  const result = await query<Order>(
    `SELECT * FROM sp_actualizar_estado_pedido($1, $2, $3, $4)`,
    [shopId, orderId, status, notes ?? null]
  );
  return result.rows[0] ?? null;
};

// ─── generarOrderNumber ya no es necesaria: la BD lo genera en sp_crear_pedido ─
// Se mantiene para retrocompatibilidad con código que la importe.
export const generarOrderNumber = async (_shopId: string): Promise<string> => {
  // Este cálculo ahora ocurre dentro de sp_crear_pedido
  throw new Error('generarOrderNumber está deprecado: el número se genera en sp_crear_pedido');
};
