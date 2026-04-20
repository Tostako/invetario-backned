// ─── Cart Service ─────────────────────────────────────────────────────────────
// Database-Centric: la validación de stock y disponibilidad de producto
// ocurre en sp_agregar_al_carrito / sp_actualizar_cantidad_carrito (BD).
// El servicio traduce errores de BD y calcula el total del resumen.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import {
  findCartItems,
  findCartItem,
  upsertCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart,
} from './cart.repository';
import { AgregarItemDto, ActualizarItemDto, CartItem, CartResumen } from './cart.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

// HU6 – Agregar producto al carrito
export const agregarAlCarritoService = async (
  shopId: string,
  customerId: string,
  dto: AgregarItemDto
): Promise<CartItem> => {
  try {
    return await upsertCartItem(shopId, customerId, dto);
  } catch (err) {
    throw traducirErrorDB(err, {
      PRODUCT_NOT_FOUND:     () => new NotFoundError('Producto'),
      PRODUCTO_NO_DISPONIBLE: () => new ValidationError('El producto no está disponible'),
      STOCK_INSUFICIENTE: (msg: string) => {
        const [disponible, solicitado] = msg.split(':')[1]?.split('|') ?? [];
        return new ValidationError(
          `Stock insuficiente. Disponible: ${disponible}, solicitado: ${solicitado}`
        );
      },
    });
  }
};

// HU7 – Ver carrito con subtotales y total
export const verCarritoService = async (
  shopId: string,
  customerId: string
): Promise<CartResumen> => {
  const items = await findCartItems(shopId, customerId);
  const total = items.reduce((acc, item) => acc + Number(item.subtotal ?? 0), 0);
  return { items, total };
};

// HU7 – Actualizar cantidad de un ítem
export const actualizarItemService = async (
  shopId: string,
  customerId: string,
  itemId: string,
  dto: ActualizarItemDto
): Promise<CartItem> => {
  try {
    const actualizado = await updateCartItemQuantity(shopId, customerId, itemId, dto.quantity);
    if (!actualizado) throw new NotFoundError('Ítem del carrito');
    return actualizado;
  } catch (err) {
    throw traducirErrorDB(err, {
      CART_ITEM_NOT_FOUND: () => new NotFoundError('Ítem del carrito'),
      STOCK_INSUFICIENTE: (msg: string) => {
        const [disponible, solicitado] = msg.split(':')[1]?.split('|') ?? [];
        return new ValidationError(
          `Stock insuficiente. Disponible: ${disponible}, solicitado: ${solicitado}`
        );
      },
    });
  }
};

// HU7 – Eliminar ítem del carrito
export const eliminarItemService = async (
  shopId: string,
  customerId: string,
  itemId: string
): Promise<void> => {
  // findCartItem para verificar pertenencia antes de eliminar
  const item = await findCartItem(shopId, customerId, itemId);
  if (!item) throw new NotFoundError('Ítem del carrito');
  await deleteCartItem(shopId, customerId, itemId);
};

// Vaciar carrito
export const vaciarCarritoService = async (
  shopId: string,
  customerId: string
): Promise<void> => {
  await clearCart(shopId, customerId);
};

export { findCartItems };
