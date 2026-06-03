"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTienda = exports.subirLogoTienda = exports.actualizarTienda = exports.obtenerTienda = void 0;
const response_1 = require("../../shared/utils/response");
const shop_types_1 = require("./shop.types");
const shop_service_1 = require("./shop.service");
const AppError_1 = require("../../shared/errors/AppError");
const pickSessionMeta = (req) => ({
    userAgent: req.headers['user-agent'] ?? null,
    ipAddress: req.ip ?? null,
});
const obtenerTienda = async (req, res, next) => {
    try {
        const data = await (0, shop_service_1.obtenerTiendaService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerTienda = obtenerTienda;
const actualizarTienda = async (req, res, next) => {
    try {
        const dto = shop_types_1.UpdateShopSchema.parse(req.body);
        const data = await (0, shop_service_1.actualizarTiendaService)(req.user.shop_id, dto);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarTienda = actualizarTienda;
const subirLogoTienda = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError_1.ValidationError('Debe enviar el archivo logo');
        }
        const data = await (0, shop_service_1.subirLogoTiendaService)(req.user.shop_id, req.file);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.subirLogoTienda = subirLogoTienda;
const eliminarTienda = async (req, res, next) => {
    try {
        const result = await (0, shop_service_1.eliminarTiendaService)(req.user.shop_id, req.user.email, pickSessionMeta(req));
        (0, response_1.sendSuccess)(res, {
            message: 'Tienda desactivada exitosamente',
            ...result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarTienda = eliminarTienda;
//# sourceMappingURL=shop.controller.js.map