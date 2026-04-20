// ─── Orders Service ───────────────────────────────────────────────────────────
// Database-Centric: el checkout completo (validar stock, crear orden/ítems,
// descontar stock, vaciar carrito) ocurre en sp_crear_pedido (BD).
// La máquina de estados la enforza trg_maquina_estados_pedido (BD).
// El servicio se encarga de: leer el carrito si no hay ítems explícitos,
// traducir errores de BD y formatear la respuesta.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import { findCartItems } from '../cart/cart.repository';
import {
  crearOrden,
  findAllOrders,
  findOrderById,
  updateOrderStatus,
} from './order.repository';
import { CrearPedidoDto, ActualizarEstadoDto, FiltrosPedido, Order } from './order.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

// HU8 – Finalizar compra
export const crearPedidoService = async (
  shopId: string,
  userId: string,
  cartCustomerId: string | null,
  dto: CrearPedidoDto
): Promise<Order> => {
  // Determinar ítems: explícitos en el body o leídos desde el carrito
  let itemsEntrada: Array<{ product_id: string; quantity: number; discount: number }>;

  if (dto.items && dto.items.length > 0) {
    itemsEntrada = dto.items;
  } else {
    if (!cartCustomerId) {
      throw new ValidationError('No se especificó cliente para leer el carrito.');
    }
    const carritoItems = await findCartItems(shopId, cartCustomerId);
    if (carritoItems.length === 0) {
      throw new ValidationError('El carrito está vacío. Agrega productos antes de finalizar la compra.');
    }
    itemsEntrada = carritoItems.map((ci) => ({
      product_id: ci.product_id,
      quantity:   ci.quantity,
      discount:   0,
    }));
  }

  try {
    const { id: orderId } = await crearOrden({
      shopId,
      userId,
      customerId: dto.customer_id ?? null,
      items:      itemsEntrada,
      notes:      dto.notes ?? null,
    });

    return findOrderById(shopId, orderId) as Promise<Order>;
  } catch (err) {
    throw traducirErrorDB(err, {
      PRODUCT_NOT_FOUND: (msg: string) =>
        new NotFoundError(`Producto ${msg.split(':')[1] ?? ''}`),
      PRODUCTO_NO_DISPONIBLE: (msg: string) =>
        new ValidationError(`El producto "${msg.split(':')[1] ?? ''}" no está disponible`),
      STOCK_INSUFICIENTE: (msg: string) => {
        // Formato: STOCK_INSUFICIENTE:"nombre"|disponible|solicitado
        const parte = msg.split(':').slice(1).join(':');
        const [nombre, disponible, solicitado] = parte.split('|');
        return new ValidationError(
          `Stock insuficiente para ${nombre}. Disponible: ${disponible}, solicitado: ${solicitado}`
        );
      },
      STOCK_INSUFICIENTE_CONCURRENTE: () =>
        new ValidationError('Stock insuficiente (conflicto de concurrencia). Intenta de nuevo.'),
    });
  }
};

// HU9 – Listar pedidos
export const listarPedidosService = async (
  shopId: string,
  filtros: FiltrosPedido
): Promise<{ pedidos: Order[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllOrders(shopId, filtros);
  return {
    pedidos: rows,
    meta: {
      total,
      page:       filtros.page,
      limit:      filtros.limit,
      totalPages: Math.ceil(total / filtros.limit),
    },
  };
};

export const obtenerPedidoService = async (
  shopId: string,
  orderId: string
): Promise<Order> => {
  const orden = await findOrderById(shopId, orderId);
  if (!orden) throw new NotFoundError('Pedido');
  return orden;
};

// HU10 – Actualizar estado del pedido
export const actualizarEstadoService = async (
  shopId: string,
  orderId: string,
  dto: ActualizarEstadoDto
): Promise<Order> => {
  try {
    const actualizado = await updateOrderStatus(shopId, orderId, dto.status, dto.notes);
    if (!actualizado) throw new NotFoundError('Pedido');
    return findOrderById(shopId, orderId) as Promise<Order>;
  } catch (err) {
    throw traducirErrorDB(err, {
      ORDER_NOT_FOUND: () => new NotFoundError('Pedido'),
      TRANSICION_INVALIDA: (msg: string) =>
        new ValidationError(msg.replace('TRANSICION_INVALIDA: ', '')),
    });
  }
};
