"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarClienteService = exports.actualizarClienteService = exports.crearClienteService = exports.obtenerClienteService = exports.listarClientesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const customer_repository_1 = require("./customer.repository");
const listarClientesService = async (shopId, q) => {
    const { rows, total } = await (0, customer_repository_1.listarClientes)(shopId, q);
    return {
        clientes: rows,
        meta: {
            total,
            page: q.page,
            limit: q.limit,
            totalPages: Math.ceil(total / q.limit),
        },
    };
};
exports.listarClientesService = listarClientesService;
const obtenerClienteService = async (shopId, customerId, q) => {
    const cliente = await (0, customer_repository_1.obtenerClientePorId)(shopId, customerId);
    if (!cliente)
        throw new AppError_1.NotFoundError('Cliente');
    if (!q.include_orders) {
        return { cliente };
    }
    const pedidos = await (0, customer_repository_1.listarPedidosCliente)(shopId, customerId);
    return { cliente, pedidos };
};
exports.obtenerClienteService = obtenerClienteService;
const crearClienteService = async (shopId, dto) => {
    if (await (0, customer_repository_1.emailExisteEnTienda)(shopId, dto.email)) {
        throw new AppError_1.ConflictError('Ya existe un cliente con ese email en esta tienda');
    }
    return (0, customer_repository_1.crearCliente)(shopId, dto);
};
exports.crearClienteService = crearClienteService;
const actualizarClienteService = async (shopId, customerId, dto) => {
    const existe = await (0, customer_repository_1.obtenerClientePorId)(shopId, customerId);
    if (!existe)
        throw new AppError_1.NotFoundError('Cliente');
    if (dto.email !== undefined && dto.email?.trim()) {
        if (await (0, customer_repository_1.emailExisteEnTienda)(shopId, dto.email, customerId)) {
            throw new AppError_1.ConflictError('Ya existe un cliente con ese email en esta tienda');
        }
    }
    const actualizado = await (0, customer_repository_1.actualizarCliente)(shopId, customerId, dto);
    if (!actualizado)
        throw new AppError_1.NotFoundError('Cliente');
    return actualizado;
};
exports.actualizarClienteService = actualizarClienteService;
const eliminarClienteService = async (shopId, customerId) => {
    const ok = await (0, customer_repository_1.desactivarCliente)(shopId, customerId);
    if (!ok)
        throw new AppError_1.NotFoundError('Cliente');
};
exports.eliminarClienteService = eliminarClienteService;
//# sourceMappingURL=customer.service.js.map