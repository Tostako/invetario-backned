"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarMovimientos = exports.listarAlertasInventario = void 0;
const database_1 = require("../../config/database");
const listarAlertasInventario = async (shopId) => {
    const r = await (0, database_1.query)(`SELECT
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
       p.name ASC`, [shopId]);
    return r.rows.map((row) => ({
        ...row,
        tipo_alerta: row.tipo_alerta,
    }));
};
exports.listarAlertasInventario = listarAlertasInventario;
const listarMovimientos = async (shopId, filtro) => {
    const condiciones = ['m.shop_id = $1'];
    const params = [shopId];
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
    const countR = await (0, database_1.query)(`SELECT COUNT(*)::text AS c
     FROM inventory_movements m
     WHERE ${whereSql}`, params);
    const total = parseInt(countR.rows[0].c, 10);
    params.push(filtro.limit, offset);
    const lim = i;
    const off = i + 1;
    const r = await (0, database_1.query)(`SELECT
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
     LIMIT $${lim} OFFSET $${off}`, params);
    const rows = r.rows.map((row) => ({
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }));
    return { rows, total };
};
exports.listarMovimientos = listarMovimientos;
//# sourceMappingURL=inventory.repository.js.map