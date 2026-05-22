"use strict";
// ─── Orders Service ───────────────────────────────────────────────────────────
// Database-Centric: el checkout completo (validar stock, crear orden/ítems,
// descontar stock, vaciar carrito) ocurre en sp_crear_pedido (BD).
// La máquina de estados la enforza trg_maquina_estados_pedido (BD).
// El servicio se encarga de: leer el carrito si no hay ítems explícitos,
// traducir errores de BD y formatear la respuesta.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstadoService = exports.obtenerPedidoService = exports.listarPedidosService = exports.crearPedidoService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const cart_repository_1 = require("../cart/cart.repository");
const order_repository_1 = require("./order.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
// HU8 – Finalizar compra
const crearPedidoService = async (shopId, userId, cartCustomerId, dto) => {
    // Determinar ítems: explícitos en el body o leídos desde el carrito
    let itemsEntrada;
    if (dto.items && dto.items.length > 0) {
        itemsEntrada = dto.items;
    }
    else {
        if (!cartCustomerId) {
            throw new AppError_1.ValidationError('No se especificó cliente para leer el carrito.');
        }
        const carritoItems = await (0, cart_repository_1.findCartItems)(shopId, cartCustomerId);
        if (carritoItems.length === 0) {
            throw new AppError_1.ValidationError('El carrito está vacío. Agrega productos antes de finalizar la compra.');
        }
        itemsEntrada = carritoItems.map((ci) => ({
            product_id: ci.product_id,
            quantity: ci.quantity,
            discount: 0,
        }));
    }
    try {
        const { id: orderId } = await (0, order_repository_1.crearOrden)({
            shopId,
            userId,
            customerId: dto.customer_id ?? null,
            items: itemsEntrada,
            notes: dto.notes ?? null,
        });
        return (0, order_repository_1.findOrderById)(shopId, orderId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PRODUCT_NOT_FOUND: (msg) => new AppError_1.NotFoundError(`Producto ${msg.split(':')[1] ?? ''}`),
            PRODUCTO_NO_DISPONIBLE: (msg) => new AppError_1.ValidationError(`El producto "${msg.split(':')[1] ?? ''}" no está disponible`),
            STOCK_INSUFICIENTE: (msg) => {
                // Formato: STOCK_INSUFICIENTE:"nombre"|disponible|solicitado
                const parte = msg.split(':').slice(1).join(':');
                const [nombre, disponible, solicitado] = parte.split('|');
                return new AppError_1.ValidationError(`Stock insuficiente para ${nombre}. Disponible: ${disponible}, solicitado: ${solicitado}`);
            },
            STOCK_INSUFICIENTE_CONCURRENTE: () => new AppError_1.ValidationError('Stock insuficiente (conflicto de concurrencia). Intenta de nuevo.'),
        });
    }
};
exports.crearPedidoService = crearPedidoService;
// HU9 – Listar pedidos
const listarPedidosService = async (shopId, filtros) => {
    const { rows, total } = await (0, order_repository_1.findAllOrders)(shopId, filtros);
    return {
        pedidos: rows,
        meta: {
            total,
            page: filtros.page,
            limit: filtros.limit,
            totalPages: Math.ceil(total / filtros.limit),
        },
    };
};
exports.listarPedidosService = listarPedidosService;
const obtenerPedidoService = async (shopId, orderId) => {
    const orden = await (0, order_repository_1.findOrderById)(shopId, orderId);
    if (!orden)
        throw new AppError_1.NotFoundError('Pedido');
    return orden;
};
exports.obtenerPedidoService = obtenerPedidoService;
// HU10 – Actualizar estado del pedido
const actualizarEstadoService = async (shopId, orderId, dto) => {
    try {
        const actualizado = await (0, order_repository_1.updateOrderStatus)(shopId, orderId, dto.status, dto.notes);
        if (!actualizado)
            throw new AppError_1.NotFoundError('Pedido');
        return (0, order_repository_1.findOrderById)(shopId, orderId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            ORDER_NOT_FOUND: () => new AppError_1.NotFoundError('Pedido'),
            TRANSICION_INVALIDA: (msg) => new AppError_1.ValidationError(msg.replace('TRANSICION_INVALIDA: ', '')),
        });
    }
};
exports.actualizarEstadoService = actualizarEstadoService;
//# sourceMappingURL=order.service.js.map