"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarItem = exports.actualizarItem = exports.agregarItem = exports.verCarrito = void 0;
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const cart_types_1 = require("./cart.types");
const cart_service_1 = require("./cart.service");
const getCustomerId = (req) => {
    if (!req.user.customer_id) {
        throw new AppError_1.ForbiddenError('Solo los clientes (customers) pueden usar el carrito.');
    }
    return req.user.customer_id;
};
// HU7 – Ver carrito
const verCarrito = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const resumen = await (0, cart_service_1.verCarritoService)(req.user.shop_id, customerId);
        (0, response_1.sendSuccess)(res, resumen);
    }
    catch (err) {
        next(err);
    }
};
exports.verCarrito = verCarrito;
// HU6 – Agregar ítem al carrito
const agregarItem = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const dto = cart_types_1.AgregarItemSchema.parse(req.body);
        const item = await (0, cart_service_1.agregarAlCarritoService)(req.user.shop_id, customerId, dto);
        (0, response_1.sendCreated)(res, item);
    }
    catch (err) {
        next(err);
    }
};
exports.agregarItem = agregarItem;
// HU7 – Actualizar cantidad de un ítem
const actualizarItem = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        const dto = cart_types_1.ActualizarItemSchema.parse(req.body);
        const item = await (0, cart_service_1.actualizarItemService)(req.user.shop_id, customerId, req.params['id'], dto);
        (0, response_1.sendSuccess)(res, item);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarItem = actualizarItem;
// HU7 – Eliminar ítem del carrito
const eliminarItem = async (req, res, next) => {
    try {
        const customerId = getCustomerId(req);
        await (0, cart_service_1.eliminarItemService)(req.user.shop_id, customerId, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Ítem eliminado del carrito' });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarItem = eliminarItem;
//# sourceMappingURL=cart.controller.js.map