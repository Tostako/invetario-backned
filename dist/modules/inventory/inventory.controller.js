"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerMovimientos = exports.obtenerAlertas = void 0;
const response_1 = require("../../shared/utils/response");
const inventory_types_1 = require("./inventory.types");
const inventory_service_1 = require("./inventory.service");
const obtenerAlertas = async (req, res, next) => {
    try {
        const data = await (0, inventory_service_1.listarAlertasService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerAlertas = obtenerAlertas;
const obtenerMovimientos = async (req, res, next) => {
    try {
        const filtro = inventory_types_1.MovimientosFilterSchema.parse(req.query);
        const { movimientos, meta } = await (0, inventory_service_1.listarMovimientosService)(req.user.shop_id, filtro);
        (0, response_1.sendSuccess)(res, movimientos, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerMovimientos = obtenerMovimientos;
//# sourceMappingURL=inventory.controller.js.map