"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerProductosTop = exports.obtenerEstadoPedidos = exports.obtenerVentasSemana = exports.obtenerPedidosMes = exports.obtenerIngresosMes = exports.obtenerResumen = void 0;
const response_1 = require("../../shared/utils/response");
const dashboard_types_1 = require("./dashboard.types");
const dashboard_service_1 = require("./dashboard.service");
const obtenerResumen = async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.resumenDashboardService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerResumen = obtenerResumen;
const obtenerIngresosMes = async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.ingresosMesService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerIngresosMes = obtenerIngresosMes;
const obtenerPedidosMes = async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.pedidosMesService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPedidosMes = obtenerPedidosMes;
const obtenerVentasSemana = async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.ventasSemanaService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerVentasSemana = obtenerVentasSemana;
const obtenerEstadoPedidos = async (req, res, next) => {
    try {
        const data = await (0, dashboard_service_1.pedidosPorEstadoService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerEstadoPedidos = obtenerEstadoPedidos;
const obtenerProductosTop = async (req, res, next) => {
    try {
        const q = dashboard_types_1.TopProductsQuerySchema.parse(req.query);
        const data = await (0, dashboard_service_1.productosTopService)(req.user.shop_id, q);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerProductosTop = obtenerProductosTop;
//# sourceMappingURL=dashboard.controller.js.map