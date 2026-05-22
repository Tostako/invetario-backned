"use strict";
// ─── Orders Repository ────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// La transacción de checkout (validar → crear → ajustar stock → vaciar carrito)
// y la máquina de estados viven en: database/20_fn_orders.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarOrderNumber = exports.updateOrderStatus = exports.findOrderById = exports.findAllOrders = exports.crearOrden = exports.findShopOrderActorUserId = void 0;
const database_1 = require("../../config/database");
/** users.id de la tienda para auditoría (orders.created_by, inventory_movements). */
const findShopOrderActorUserId = async (shopId) => {
    const result = await (0, database_1.query)(`SELECT id FROM users
     WHERE shop_id = $1 AND is_active = TRUE
     ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, created_at ASC
     LIMIT 1`, [shopId]);
    return result.rows[0]?.id ?? null;
};
exports.findShopOrderActorUserId = findShopOrderActorUserId;
// ─── Crear pedido — delegado completamente a la BD ───────────────────────────
const crearOrden = async (params) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_pedido($1, $2, $3, $4::jsonb, $5)`, [
        params.shopId,
        params.userId,
        params.customerId,
        JSON.stringify(params.items),
        params.notes,
    ]);
    const row = result.rows[0];
    return { id: row.order_id, order_number: row.order_number, total: parseFloat(row.total) };
};
exports.crearOrden = crearOrden;
// ─── Listar pedidos ───────────────────────────────────────────────────────────
const findAllOrders = async (shopId, filtros) => {
    const offset = (filtros.page - 1) * filtros.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_pedidos($1, $2, $3, $4, $5, $6, $7)`, [
        shopId,
        filtros.status ?? null,
        filtros.customer_id ?? null,
        filtros.desde ?? null,
        filtros.hasta ?? null,
        filtros.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllOrders = findAllOrders;
// ─── Obtener pedido con sus ítems ─────────────────────────────────────────────
const findOrderById = async (shopId, orderId) => {
    const [orderResult, itemsResult] = await Promise.all([
        (0, database_1.query)(`SELECT * FROM fn_obtener_pedido($1, $2)`, [shopId, orderId]),
        (0, database_1.query)(`SELECT * FROM fn_listar_items_pedido($1, $2)`, [shopId, orderId]),
    ]);
    const orden = orderResult.rows[0];
    if (!orden)
        return null;
    orden.items = itemsResult.rows;
    return orden;
};
exports.findOrderById = findOrderById;
// ─── Actualizar estado ────────────────────────────────────────────────────────
const updateOrderStatus = async (shopId, orderId, status, notes) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_estado_pedido($1, $2, $3, $4)`, [shopId, orderId, status, notes ?? null]);
    return result.rows[0] ?? null;
};
exports.updateOrderStatus = updateOrderStatus;
// ─── generarOrderNumber ya no es necesaria: la BD lo genera en sp_crear_pedido ─
// Se mantiene para retrocompatibilidad con código que la importe.
const generarOrderNumber = async (_shopId) => {
    // Este cálculo ahora ocurre dentro de sp_crear_pedido
    throw new Error('generarOrderNumber está deprecado: el número se genera en sp_crear_pedido');
};
exports.generarOrderNumber = generarOrderNumber;
//# sourceMappingURL=order.repository.js.map