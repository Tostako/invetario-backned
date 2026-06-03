"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstado = exports.obtenerPedido = exports.listarMisPedidos = exports.listarPedidos = exports.crearPedido = void 0;
const response_1 = require("../../shared/utils/response");
const order_types_1 = require("./order.types");
const order_service_1 = require("./order.service");
const order_repository_1 = require("./order.repository");
const AppError_1 = require("../../shared/errors/AppError");
// HU8 – Finalizar compra (crea pedido desde carrito o ítems explícitos)
const crearPedido = async (req, res, next) => {
    try {
        const dto = order_types_1.CrearPedidoSchema.parse(req.body);
        // Si es un customer, forzamos su customer_id.
        // Si es staff, puede pasarlo en el body.
        let customerIdStr = dto.customer_id;
        if (req.user.role === 'customer') {
            customerIdStr = req.user.customer_id;
        }
        const dtoConCustomer = { ...dto, customer_id: customerIdStr };
        // customers.id ≠ users.id: la BD exige users.id en created_by e inventory_movements.
        let dbUserIdForAudit = req.user.id;
        if (req.user.role === 'customer') {
            const actorId = await (0, order_repository_1.findShopOrderActorUserId)(req.user.shop_id);
            if (!actorId) {
                throw new AppError_1.ValidationError('La tienda no tiene un usuario activo para registrar el pedido en auditoría.');
            }
            dbUserIdForAudit = actorId;
        }
        const orden = await (0, order_service_1.crearPedidoService)(req.user.shop_id, dbUserIdForAudit, req.user.customer_id ?? null, // Si es un customer, usamos su customer_id para vaciar SU carrito
        dtoConCustomer);
        (0, response_1.sendCreated)(res, orden);
    }
    catch (err) {
        next(err);
    }
};
exports.crearPedido = crearPedido;
// HU9 – Listar pedidos
const listarPedidos = async (req, res, next) => {
    try {
        const filtros = order_types_1.FiltrosPedidoSchema.parse(req.query);
        const { pedidos, meta } = await (0, order_service_1.listarPedidosService)(req.user.shop_id, filtros);
        (0, response_1.sendSuccess)(res, pedidos, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listarPedidos = listarPedidos;
// Listar pedidos del cliente autenticado
const listarMisPedidos = async (req, res, next) => {
    try {
        const filtros = order_types_1.FiltrosPedidoSchema.parse({
            ...req.query,
            customer_id: req.user.customer_id ?? req.user.id,
        });
        const { pedidos, meta } = await (0, order_service_1.listarPedidosService)(req.user.shop_id, filtros);
        (0, response_1.sendSuccess)(res, pedidos, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listarMisPedidos = listarMisPedidos;
// Obtener detalle de un pedido
const obtenerPedido = async (req, res, next) => {
    try {
        const orden = await (0, order_service_1.obtenerPedidoService)(req.user.shop_id, req.params['id']);
        if (req.user.role === 'customer' && orden.customer_id !== req.user.customer_id) {
            throw new AppError_1.ForbiddenError('No tienes permiso para ver este pedido.');
        }
        (0, response_1.sendSuccess)(res, orden);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPedido = obtenerPedido;
// HU10 – Actualizar estado del pedido
const actualizarEstado = async (req, res, next) => {
    try {
        const dto = order_types_1.ActualizarEstadoSchema.parse(req.body);
        const orden = await (0, order_service_1.actualizarEstadoService)(req.user.shop_id, req.params['id'], dto);
        (0, response_1.sendSuccess)(res, orden);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarEstado = actualizarEstado;
//# sourceMappingURL=order.controller.js.map