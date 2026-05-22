"use strict";
// ─── Products Repository ─────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/17_fn_products.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.softDeleteProduct = exports.updateProduct = exports.createProduct = exports.findProductById = exports.findAllProducts = void 0;
const database_1 = require("../../config/database");
const findAllProducts = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_productos($1, $2, $3, $4, $5, $6, $7, $8)`, [
        shopId,
        filter.search ?? null,
        filter.category_id ?? null,
        filter.supplier_id ?? null,
        filter.low_stock ?? false,
        filter.is_active ?? true,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllProducts = findAllProducts;
const findProductById = async (shopId, productId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_producto($1, $2)`, [shopId, productId]);
    return result.rows[0] ?? null;
};
exports.findProductById = findProductById;
const createProduct = async (shopId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, [
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
    ]);
    return result.rows[0];
};
exports.createProduct = createProduct;
const updateProduct = async (shopId, productId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`, [
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
    ]);
    return result.rows[0] ?? null;
};
exports.updateProduct = updateProduct;
const softDeleteProduct = async (shopId, productId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_producto($1, $2)`, [shopId, productId]);
    return true;
};
exports.softDeleteProduct = softDeleteProduct;
const adjustStock = async (shopId, productId, delta, userId, tipo = 'adjustment', orderId, notas) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_ajustar_stock($1, $2, $3, $4, $5, $6, $7)`, [shopId, productId, delta, userId, tipo, orderId ?? null, notas ?? null]);
    return result.rows[0] ?? null;
};
exports.adjustStock = adjustStock;
//# sourceMappingURL=product.repository.js.map