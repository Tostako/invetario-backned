"use strict";
// ─── Cart Repository ──────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Las validaciones de stock y disponibilidad de producto viven en:
//   database/19_fn_cart.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.deleteCartItem = exports.updateCartItemQuantity = exports.upsertCartItem = exports.findCartItem = exports.findCartItems = void 0;
const database_1 = require("../../config/database");
const findCartItems = async (shopId, customerId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_ver_carrito($1, $2)`, [shopId, customerId]);
    return result.rows;
};
exports.findCartItems = findCartItems;
const findCartItem = async (shopId, customerId, itemId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_item_carrito($1, $2, $3)`, [shopId, customerId, itemId]);
    return result.rows[0] ?? null;
};
exports.findCartItem = findCartItem;
const upsertCartItem = async (shopId, customerId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_agregar_al_carrito($1, $2, $3, $4)`, [shopId, customerId, dto.product_id, dto.quantity]);
    return result.rows[0];
};
exports.upsertCartItem = upsertCartItem;
const updateCartItemQuantity = async (shopId, customerId, itemId, quantity) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_cantidad_carrito($1, $2, $3, $4)`, [shopId, customerId, itemId, quantity]);
    return result.rows[0] ?? null;
};
exports.updateCartItemQuantity = updateCartItemQuantity;
const deleteCartItem = async (shopId, customerId, itemId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_item_carrito($1, $2, $3)`, [shopId, customerId, itemId]);
    return true;
};
exports.deleteCartItem = deleteCartItem;
const clearCart = async (shopId, customerId) => {
    await (0, database_1.query)(`SELECT sp_vaciar_carrito($1, $2)`, [shopId, customerId]);
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.repository.js.map