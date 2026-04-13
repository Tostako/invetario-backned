import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import { findProductById } from '../products/product.repository';
import { findCartItems, clearCart } from '../cart/cart.repository';
import {
  generarOrderNumber,
  crearOrden,
  findAllOrders,
  findOrderById,
  updateOrderStatus,
} from './order.repository';
import { CrearPedidoDto, ActualizarEstadoDto, FiltrosPedido, Order } from './order.types';

// HU8 – Finalizar compra
// Si se pasan items explícitos los usa; si no, toma el carrito del usuario
export const crearPedidoService = async (
  shopId: string,
  userId: string,
  dto: CrearPedidoDto
): Promise<Order> => {
  // ── Determinar los ítems a procesar ───────────────────────────────────────
  let itemsEntrada: Array<{ product_id: string; quantity: number; discount: number }>;

  if (dto.items && dto.items.length > 0) {
    itemsEntrada = dto.items;
  } else {
    const carritoItems = await findCartItems(shopId, userId);
    if (carritoItems.length === 0) {
      throw new ValidationError('El carrito está vacío. Agrega productos antes de finalizar la compra.');
    }
    itemsEntrada = carritoItems.map((ci) => ({
      product_id: ci.product_id,
      quantity:   ci.quantity,
      discount:   0,
    }));
  }

  // ── Enriquecer con precios actuales y validar stock ───────────────────────
  let subtotalGeneral = 0;
  let descuentoGeneral = 0;

  const itemsParaInsertar = await Promise.all(
    itemsEntrada.map(async (entrada) => {
      const producto = await findProductById(shopId, entrada.product_id);
      if (!producto) throw new NotFoundError(`Producto ${entrada.product_id}`);
      if (!producto.is_active) {
        throw new ValidationError(`El producto "${producto.name}" no está disponible`);
      }
      if (entrada.quantity > producto.stock) {
        throw new ValidationError(
          `Stock insuficiente para "${producto.name}". Disponible: ${producto.stock}`
        );
      }

      const subtotalItem = producto.price * entrada.quantity - entrada.discount;
      subtotalGeneral  += producto.price * entrada.quantity;
      descuentoGeneral += entrada.discount;

      return {
        product_id: entrada.product_id,
        quantity:   entrada.quantity,
        unit_price: producto.price,
        discount:   entrada.discount,
        subtotal:   subtotalItem,
      };
    })
  );

  const impuesto = 0; // Configurar según jurisdicción si aplica
  const total    = subtotalGeneral - descuentoGeneral + impuesto;

  const orderNumber = await generarOrderNumber(shopId);

  const orden = await crearOrden({
    shopId,
    userId,
    customerId:  dto.customer_id ?? null,
    orderNumber,
    subtotal:    subtotalGeneral,
    discount:    descuentoGeneral,
    tax:         impuesto,
    total,
    notes:       dto.notes ?? null,
    items:       itemsParaInsertar,
  });

  // Vaciar carrito tras checkout exitoso
  await clearCart(shopId, userId);

  return findOrderById(shopId, orden.id) as Promise<Order>;
};

// HU9 – Listar pedidos (admin)
export const listarPedidosService = async (
  shopId: string,
  filtros: FiltrosPedido
): Promise<{ pedidos: Order[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllOrders(shopId, filtros);

  const meta: PaginationMeta = {
    total,
    page:       filtros.page,
    limit:      filtros.limit,
    totalPages: Math.ceil(total / filtros.limit),
  };

  return { pedidos: rows, meta };
};

// Obtener detalle de un pedido
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
  const orden = await findOrderById(shopId, orderId);
  if (!orden) throw new NotFoundError('Pedido');

  // Validar transición de estado
  validarTransicionEstado(orden.status, dto.status);

  const actualizado = await updateOrderStatus(shopId, orderId, dto.status, dto.notes);
  if (!actualizado) throw new NotFoundError('Pedido');

  return findOrderById(shopId, orderId) as Promise<Order>;
};

// ── Reglas de transición de estado ────────────────────────────────────────────
const transicionesValidas: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],
  cancelled: [],
};

function validarTransicionEstado(actual: string, nuevo: string): void {
  const permitidos = transicionesValidas[actual] ?? [];
  if (!permitidos.includes(nuevo)) {
    throw new ValidationError(
      `No se puede cambiar el estado de "${actual}" a "${nuevo}". ` +
      `Transiciones válidas: ${permitidos.join(', ') || 'ninguna'}`
    );
  }
}
