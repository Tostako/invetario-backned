import { query } from '../../config/database';
import { Order, OrderItem, FiltrosPedido, EstadoPedido } from './order.types';

// REGLA: shop_id es siempre el primer filtro WHERE — nunca leer órdenes sin tenant

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
  orderNumber: string;
  subtotal:    number;
  discount:    number;
  tax:         number;
  total:       number;
  notes:       string | null;
  items:       ItemParaInsertar[];
}

interface FindAllResult {
  rows:  Order[];
  total: number;
}

// ─── Generar número de orden legible ──────────────────────────────────────────

export const generarOrderNumber = async (shopId: string): Promise<string> => {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM orders WHERE shop_id = $1`,
    [shopId]
  );
  const seq = parseInt(result.rows[0]!.count) + 1;
  const anio = new Date().getFullYear();
  return `ORD-${anio}-${String(seq).padStart(4, '0')}`;
};

// ─── Crear orden + ítems en una sola transacción ──────────────────────────────

export const crearOrden = async (params: CrearPedidoParams): Promise<Order> => {
  // Usamos una transacción explícita para garantizar atomicidad
  await query('BEGIN', []);

  try {
    const orderResult = await query<Order>(
      `INSERT INTO orders
         (shop_id, customer_id, created_by, order_number, status,
          subtotal, discount, tax, total, notes)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        params.shopId,
        params.customerId,
        params.userId,
        params.orderNumber,
        params.subtotal,
        params.discount,
        params.tax,
        params.total,
        params.notes,
      ]
    );

    const orden = orderResult.rows[0]!;

    // Insertar todos los ítems
    for (const item of params.items) {
      await query(
        `INSERT INTO order_items
           (shop_id, order_id, product_id, quantity, unit_price, discount, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          params.shopId,
          orden.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount,
          item.subtotal,
        ]
      );

      // Descontar stock atómicamente — falla si stock queda negativo
      const stockResult = await query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2 AND shop_id = $3 AND (stock - $1) >= 0
         RETURNING id`,
        [item.quantity, item.product_id, params.shopId]
      );

      if ((stockResult.rowCount ?? 0) === 0) {
        throw new Error(`Stock insuficiente para el producto ${item.product_id}`);
      }
    }

    await query('COMMIT', []);
    return orden;
  } catch (err) {
    await query('ROLLBACK', []);
    throw err;
  }
};

// ─── HU9 – Listar pedidos con filtros ─────────────────────────────────────────

export const findAllOrders = async (
  shopId: string,
  filtros: FiltrosPedido
): Promise<FindAllResult> => {
  const conditions: string[] = ['o.shop_id = $1'];
  const params: unknown[]    = [shopId];
  let idx = 2;

  if (filtros.status) {
    conditions.push(`o.status = $${idx}`);
    params.push(filtros.status);
    idx++;
  }

  if (filtros.customer_id) {
    conditions.push(`o.customer_id = $${idx}`);
    params.push(filtros.customer_id);
    idx++;
  }

  if (filtros.desde) {
    conditions.push(`o.created_at >= $${idx}`);
    params.push(filtros.desde);
    idx++;
  }

  if (filtros.hasta) {
    conditions.push(`o.created_at <= $${idx}`);
    params.push(filtros.hasta);
    idx++;
  }

  const where  = conditions.join(' AND ');
  const offset = (filtros.page - 1) * filtros.limit;

  const result = await query<Order & { total_count: string }>(
    `SELECT
       o.*,
       c.name AS customer_name,
       COUNT(*) OVER() AS total_count
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id AND c.shop_id = o.shop_id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, filtros.limit, offset]
  );

  return {
    rows:  result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

// ─── Obtener una orden con sus ítems ──────────────────────────────────────────

export const findOrderById = async (
  shopId: string,
  orderId: string
): Promise<Order | null> => {
  const orderResult = await query<Order>(
    `SELECT o.*, c.name AS customer_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id AND c.shop_id = o.shop_id
     WHERE o.id = $1 AND o.shop_id = $2`,
    [orderId, shopId]
  );

  const orden = orderResult.rows[0];
  if (!orden) return null;

  const itemsResult = await query<OrderItem>(
    `SELECT oi.*, p.name AS product_name, p.sku AS product_sku
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1 AND oi.shop_id = $2`,
    [orderId, shopId]
  );

  orden.items = itemsResult.rows;
  return orden;
};

// ─── HU10 – Actualizar estado del pedido ──────────────────────────────────────

export const updateOrderStatus = async (
  shopId: string,
  orderId: string,
  status: EstadoPedido,
  notes?: string
): Promise<Order | null> => {
  const fields: string[] = ['status = $1', 'updated_at = NOW()'];
  const params: unknown[] = [status];
  let idx = 2;

  if (notes !== undefined) {
    fields.push(`notes = $${idx}`);
    params.push(notes);
    idx++;
  }

  params.push(orderId, shopId);

  const result = await query<Order>(
    `UPDATE orders
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND shop_id = $${idx + 1}
     RETURNING *`,
    params
  );

  return result.rows[0] ?? null;
};
