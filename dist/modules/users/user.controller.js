"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable2fa = exports.enable2fa = exports.setup2fa = exports.eliminarSesion = exports.listarSesiones = exports.actualizarPreferencias = exports.obtenerPreferencias = exports.cambiarPassword = exports.actualizarPerfil = exports.obtenerPerfil = void 0;
const response_1 = require("../../shared/utils/response");
const user_types_1 = require("./user.types");
const user_service_1 = require("./user.service");
const obtenerPerfil = async (req, res, next) => {
    try {
        const data = await (0, user_service_1.obtenerPerfilService)(req.user.shop_id, req.user.id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPerfil = obtenerPerfil;
const actualizarPerfil = async (req, res, next) => {
    try {
        const dto = user_types_1.UpdateProfileSchema.parse(req.body);
        const data = await (0, user_service_1.actualizarPerfilService)(req.user.shop_id, req.user.id, dto);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarPerfil = actualizarPerfil;
const cambiarPassword = async (req, res, next) => {
    try {
        const dto = user_types_1.ChangePasswordSchema.parse(req.body);
        await (0, user_service_1.cambiarPasswordService)(req.user.shop_id, req.user.id, dto);
        (0, response_1.sendSuccess)(res, { message: 'Contraseña actualizada correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.cambiarPassword = cambiarPassword;
const obtenerPreferencias = async (req, res, next) => {
    try {
        const data = await (0, user_service_1.obtenerPreferenciasService)(req.user.shop_id, req.user.id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerPreferencias = obtenerPreferencias;
const actualizarPreferencias = async (req, res, next) => {
    try {
        const patch = user_types_1.NotificationPreferencesSchema.parse(req.body);
        const data = await (0, user_service_1.actualizarPreferenciasService)(req.user.shop_id, req.user.id, patch);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarPreferencias = actualizarPreferencias;
const listarSesiones = async (req, res, next) => {
    try {
        const data = await (0, user_service_1.listarSesionesService)(req.user.shop_id, req.user.id, req.user.jti);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.listarSesiones = listarSesiones;
const eliminarSesion = async (req, res, next) => {
    try {
        await (0, user_service_1.revocarSesionService)(req.user.shop_id, req.user.id, req.params['sessionId']);
        (0, response_1.sendSuccess)(res, { message: 'Sesión revocada' });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarSesion = eliminarSesion;
const setup2fa = async (req, res, next) => {
    try {
        const data = await (0, user_service_1.configurar2faService)(req.user.shop_id, req.user.id);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.setup2fa = setup2fa;
const enable2fa = async (req, res, next) => {
    try {
        const { code } = user_types_1.Enable2faSchema.parse(req.body);
        const data = await (0, user_service_1.activar2faService)(req.user.shop_id, req.user.id, code);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.enable2fa = enable2fa;
const disable2fa = async (req, res, next) => {
    try {
        const { password } = user_types_1.Disable2faSchema.parse(req.body);
        const data = await (0, user_service_1.desactivar2faService)(req.user.shop_id, req.user.id, password);
        (0, response_1.sendSuccess)(res, data);
    }
    catch (err) {
        next(err);
    }
};
exports.disable2fa = disable2fa;
//# sourceMappingURL=user.controller.js.map