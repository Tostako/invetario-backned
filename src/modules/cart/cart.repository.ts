import { query } from '../../config/database';
import { AgregarItemDto, CartItem } from './cart.types';

// REGLA: shop_id + user_id son obligatorios en todas las queries (tenant + dueño del carrito)

export const findCartItems = async (
  shopId: string,
  userId: string
): Promise<CartItem[]> => {
  const result = await query<CartItem>(
    `SELECT
       ci.*,
       p.name   AS product_name,
       p.sku    AS product_sku,
       p.price  AS unit_price,
       p.stock  AS stock_available,
       (p.price * ci.quantity) AS subtotal
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id
     WHERE ci.shop_id = $1 AND ci.user_id = $2
     ORDER BY ci.created_at ASC`,
    [shopId, userId]
  );
  return result.rows;
};

export const findCartItem = async (
  shopId: string,
  userId: string,
  itemId: string
): Promise<CartItem | null> => {
  const result = await query<CartItem>(
    `SELECT ci.*, p.name AS product_name, p.price AS unit_price, p.stock AS stock_available
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id
     WHERE ci.id = $1 AND ci.shop_id = $2 AND ci.user_id = $3`,
    [itemId, shopId, userId]
  );
  return result.rows[0] ?? null;
};

export const findCartItemByProduct = async (
  shopId: string,
  userId: string,
  productId: string
): Promise<CartItem | null> => {
  const result = await query<CartItem>(
    `SELECT * FROM cart_items
     WHERE shop_id = $1 AND user_id = $2 AND product_id = $3`,
    [shopId, userId, productId]
  );
  return result.rows[0] ?? null;
};

export const upsertCartItem = async (
  shopId: string,
  userId: string,
  dto: AgregarItemDto
): Promise<CartItem> => {
  // Si el producto ya existe en el carrito, suma la cantidad
  const result = await query<CartItem>(
    `INSERT INTO cart_items (shop_id, user_id, product_id, quantity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id, shop_id)
     DO UPDATE SET
       quantity   = cart_items.quantity + EXCLUDED.quantity,
       updated_at = NOW()
     RETURNING *`,
    [shopId, userId, dto.product_id, dto.quantity]
  );
  return result.rows[0]!;
};

export const updateCartItemQuantity = async (
  shopId: string,
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartItem | null> => {
  const result = await query<CartItem>(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND shop_id = $3 AND user_id = $4
     RETURNING *`,
    [quantity, itemId, shopId, userId]
  );
  return result.rows[0] ?? null;
};

export const deleteCartItem = async (
  shopId: string,
  userId: string,
  itemId: string
): Promise<boolean> => {
  const result = await query(
    `DELETE FROM cart_items
     WHERE id = $1 AND shop_id = $2 AND user_id = $3`,
    [itemId, shopId, userId]
  );
  return (result.rowCount ?? 0) > 0;
};

export const clearCart = async (
  shopId: string,
  userId: string
): Promise<void> => {
  await query(
    `DELETE FROM cart_items WHERE shop_id = $1 AND user_id = $2`,
    [shopId, userId]
  );
};
