// ─── Cart Repository ──────────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Las validaciones de stock y disponibilidad de producto viven en:
//   database/19_fn_cart.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { AgregarItemDto, CartItem } from './cart.types';

export const findCartItems = async (
  shopId: string,
  customerId: string
): Promise<CartItem[]> => {
  const result = await query<CartItem>(
    `SELECT * FROM fn_ver_carrito($1, $2)`,
    [shopId, customerId]
  );
  return result.rows;
};

export const findCartItem = async (
  shopId: string,
  customerId: string,
  itemId: string
): Promise<CartItem | null> => {
  const result = await query<CartItem>(
    `SELECT * FROM fn_obtener_item_carrito($1, $2, $3)`,
    [shopId, customerId, itemId]
  );
  return result.rows[0] ?? null;
};

export const upsertCartItem = async (
  shopId: string,
  customerId: string,
  dto: AgregarItemDto
): Promise<CartItem> => {
  const result = await query<CartItem>(
    `SELECT * FROM sp_agregar_al_carrito($1, $2, $3, $4)`,
    [shopId, customerId, dto.product_id, dto.quantity]
  );
  return result.rows[0]!;
};

export const updateCartItemQuantity = async (
  shopId: string,
  customerId: string,
  itemId: string,
  quantity: number
): Promise<CartItem | null> => {
  const result = await query<CartItem>(
    `SELECT * FROM sp_actualizar_cantidad_carrito($1, $2, $3, $4)`,
    [shopId, customerId, itemId, quantity]
  );
  return result.rows[0] ?? null;
};

export const deleteCartItem = async (
  shopId: string,
  customerId: string,
  itemId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_item_carrito($1, $2, $3)`, [shopId, customerId, itemId]);
  return true;
};

export const clearCart = async (
  shopId: string,
  customerId: string
): Promise<void> => {
  await query(`SELECT sp_vaciar_carrito($1, $2)`, [shopId, customerId]);
};
