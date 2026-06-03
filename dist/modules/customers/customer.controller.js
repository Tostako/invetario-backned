"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarCliente = exports.actualizarCliente = exports.crearCliente = exports.obtenerCliente = exports.listarClientes = void 0;
const response_1 = require("../../shared/utils/response");
const customer_types_1 = require("./customer.types");
const customer_service_1 = require("./customer.service");
const listarClientes = async (req, res, next) => {
    try {
        const q = customer_types_1.ListCustomersQuerySchema.parse(req.query);
        const { clientes, meta } = await (0, customer_service_1.listarClientesService)(req.user.shop_id, q);
        (0, response_1.sendSuccess)(res, clientes, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listarClientes = listarClientes;
const obtenerCliente = async (req, res, next) => {
    try {
        const q = customer_types_1.CustomerDetailQuerySchema.parse(req.query);
        const data = await (0, customer_service_1.obtenerClienteService)(req.user.shop_id, req.params['id'], q);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerCliente = obtenerCliente;
const crearCliente = async (req, res, next) => {
    try {
        const dto = customer_types_1.CreateCustomerSchema.parse(req.body);
        const cliente = await (0, customer_service_1.crearClienteService)(req.user.shop_id, dto);
        (0, response_1.sendCreated)(res, cliente);
    }
    catch (err) {
        next(err);
    }
};
exports.crearCliente = crearCliente;
const actualizarCliente = async (req, res, next) => {
    try {
        const dto = customer_types_1.UpdateCustomerSchema.parse(req.body);
        const cliente = await (0, customer_service_1.actualizarClienteService)(req.user.shop_id, req.params['id'], dto);
        (0, response_1.sendSuccess)(res, cliente);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarCliente = actualizarCliente;
const eliminarCliente = async (req, res, next) => {
    try {
        await (0, customer_service_1.eliminarClienteService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Cliente desactivado correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarCliente = eliminarCliente;
//# sourceMappingURL=customer.controller.js.map