import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { findProductById } from '../products/product.repository';
import {
  findCartItems,
  findCartItem,
  upsertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart,
} from './cart.repository';
import { AgregarItemDto, ActualizarItemDto, CartItem, CartResumen } from './cart.types';

// HU6 – Agregar producto al carrito
export const agregarAlCarritoService = async (
  shopId: string,
  userId: string,
  dto: AgregarItemDto
): Promise<CartItem> => {
  const producto = await findProductById(shopId, dto.product_id);
  if (!producto) throw new NotFoundError('Producto');
  if (!producto.is_active) throw new ValidationError('El producto no está disponible');

  if (dto.quantity > producto.stock) {
    throw new ValidationError(
      `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${dto.quantity}`
    );
  }

  return upsertCartItem(shopId, userId, dto);
};

// HU7 – Ver carrito con subtotales y total
export const verCarritoService = async (
  shopId: string,
  userId: string
): Promise<CartResumen> => {
  const items = await findCartItems(shopId, userId);
  const total = items.reduce((acc, item) => acc + Number(item.subtotal ?? 0), 0);
  return { items, total };
};

// HU7 – Actualizar cantidad de un ítem
export const actualizarItemService = async (
  shopId: string,
  userId: string,
  itemId: string,
  dto: ActualizarItemDto
): Promise<CartItem> => {
  const item = await findCartItem(shopId, userId, itemId);
  if (!item) throw new NotFoundError('Ítem del carrito');

  const producto = await findProductById(shopId, item.product_id);
  if (!producto) throw new NotFoundError('Producto');

  if (dto.quantity > producto.stock) {
    throw new ValidationError(
      `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${dto.quantity}`
    );
  }

  const actualizado = await updateCartItemQuantity(shopId, userId, itemId, dto.quantity);
  if (!actualizado) throw new NotFoundError('Ítem del carrito');
  return actualizado;
};

// HU7 – Eliminar ítem del carrito
export const eliminarItemService = async (
  shopId: string,
  userId: string,
  itemId: string
): Promise<void> => {
  const eliminado = await deleteCartItem(shopId, userId, itemId);
  if (!eliminado) throw new NotFoundError('Ítem del carrito');
};

// Vaciar carrito (llamado internamente al checkout)
export const vaciarCarritoService = async (
  shopId: string,
  userId: string
): Promise<void> => {
  await clearCart(shopId, userId);
};

export { findCartItems };
