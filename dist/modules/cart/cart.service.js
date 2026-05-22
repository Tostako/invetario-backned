"use strict";
// ─── Cart Service ─────────────────────────────────────────────────────────────
// Database-Centric: la validación de stock y disponibilidad de producto
// ocurre en sp_agregar_al_carrito / sp_actualizar_cantidad_carrito (BD).
// El servicio traduce errores de BD y calcula el total del resumen.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCartItems = exports.vaciarCarritoService = exports.eliminarItemService = exports.actualizarItemService = exports.verCarritoService = exports.agregarAlCarritoService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const cart_repository_1 = require("./cart.repository");
Object.defineProperty(exports, "findCartItems", { enumerable: true, get: function () { return cart_repository_1.findCartItems; } });
const dbErrors_1 = require("../../shared/utils/dbErrors");
// HU6 – Agregar producto al carrito
const agregarAlCarritoService = async (shopId, customerId, dto) => {
    try {
        return await (0, cart_repository_1.upsertCartItem)(shopId, customerId, dto);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PRODUCT_NOT_FOUND: () => new AppError_1.NotFoundError('Producto'),
            PRODUCTO_NO_DISPONIBLE: () => new AppError_1.ValidationError('El producto no está disponible'),
            STOCK_INSUFICIENTE: (msg) => {
                const [disponible, solicitado] = msg.split(':')[1]?.split('|') ?? [];
                return new AppError_1.ValidationError(`Stock insuficiente. Disponible: ${disponible}, solicitado: ${solicitado}`);
            },
        });
    }
};
exports.agregarAlCarritoService = agregarAlCarritoService;
// HU7 – Ver carrito con subtotales y total
const verCarritoService = async (shopId, customerId) => {
    const items = await (0, cart_repository_1.findCartItems)(shopId, customerId);
    const total = items.reduce((acc, item) => acc + Number(item.subtotal ?? 0), 0);
    return { items, total };
};
exports.verCarritoService = verCarritoService;
// HU7 – Actualizar cantidad de un ítem
const actualizarItemService = async (shopId, customerId, itemId, dto) => {
    try {
        const actualizado = await (0, cart_repository_1.updateCartItemQuantity)(shopId, customerId, itemId, dto.quantity);
        if (!actualizado)
            throw new AppError_1.NotFoundError('Ítem del carrito');
        return actualizado;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CART_ITEM_NOT_FOUND: () => new AppError_1.NotFoundError('Ítem del carrito'),
            STOCK_INSUFICIENTE: (msg) => {
                const [disponible, solicitado] = msg.split(':')[1]?.split('|') ?? [];
                return new AppError_1.ValidationError(`Stock insuficiente. Disponible: ${disponible}, solicitado: ${solicitado}`);
            },
        });
    }
};
exports.actualizarItemService = actualizarItemService;
// HU7 – Eliminar ítem del carrito
const eliminarItemService = async (shopId, customerId, itemId) => {
    // findCartItem para verificar pertenencia antes de eliminar
    const item = await (0, cart_repository_1.findCartItem)(shopId, customerId, itemId);
    if (!item)
        throw new AppError_1.NotFoundError('Ítem del carrito');
    await (0, cart_repository_1.deleteCartItem)(shopId, customerId, itemId);
};
exports.eliminarItemService = eliminarItemService;
// Vaciar carrito
const vaciarCarritoService = async (shopId, customerId) => {
    await (0, cart_repository_1.clearCart)(shopId, customerId);
};
exports.vaciarCarritoService = vaciarCarritoService;
//# sourceMappingURL=cart.service.js.map