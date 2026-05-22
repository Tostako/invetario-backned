"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarMovimientosService = exports.listarAlertasService = void 0;
const inventory_repository_1 = require("./inventory.repository");
const listarAlertasService = (shopId) => (0, inventory_repository_1.listarAlertasInventario)(shopId);
exports.listarAlertasService = listarAlertasService;
const listarMovimientosService = async (shopId, filtro) => {
    const { rows, total } = await (0, inventory_repository_1.listarMovimientos)(shopId, filtro);
    return {
        movimientos: rows,
        meta: {
            total,
            page: filtro.page,
            limit: filtro.limit,
            totalPages: Math.ceil(total / filtro.limit),
        },
    };
};
exports.listarMovimientosService = listarMovimientosService;
//# sourceMappingURL=inventory.service.js.map