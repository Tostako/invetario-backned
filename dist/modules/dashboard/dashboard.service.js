"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productosTopService = exports.pedidosPorEstadoService = exports.ventasSemanaService = exports.pedidosMesService = exports.ingresosMesService = exports.resumenDashboardService = void 0;
const dashboard_repository_1 = require("./dashboard.repository");
const resumenDashboardService = (shopId) => (0, dashboard_repository_1.obtenerResumenDashboard)(shopId);
exports.resumenDashboardService = resumenDashboardService;
const ingresosMesService = (shopId) => (0, dashboard_repository_1.obtenerIngresosMesConMeta)(shopId);
exports.ingresosMesService = ingresosMesService;
const pedidosMesService = (shopId) => (0, dashboard_repository_1.obtenerPedidosMesConMeta)(shopId);
exports.pedidosMesService = pedidosMesService;
const ventasSemanaService = (shopId) => (0, dashboard_repository_1.obtenerVentasSemana)(shopId);
exports.ventasSemanaService = ventasSemanaService;
const pedidosPorEstadoService = (shopId) => (0, dashboard_repository_1.obtenerPedidosPorEstado)(shopId);
exports.pedidosPorEstadoService = pedidosPorEstadoService;
const productosTopService = (shopId, q) => (0, dashboard_repository_1.obtenerProductosTop)(shopId, q);
exports.productosTopService = productosTopService;
//# sourceMappingURL=dashboard.service.js.map