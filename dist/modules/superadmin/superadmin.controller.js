"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTienda = exports.actualizarTienda = exports.crearTienda = exports.obtenerTienda = exports.listarTiendas = exports.registrarSuperAdmin = exports.bootstrapSuperAdmin = exports.loginSuperAdmin = void 0;
const superadmin_types_1 = require("./superadmin.types");
const superadmin_service_1 = require("./superadmin.service");
const response_1 = require("../../shared/utils/response");
const pagination_1 = require("../../shared/utils/pagination");
// ─── Auth ─────────────────────────────────────────────────────────────────────
const loginSuperAdmin = async (req, res, next) => {
    try {
        const dto = superadmin_types_1.LoginSuperAdminSchema.parse(req.body);
        const result = await (0, superadmin_service_1.loginSuperAdminService)(dto);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.loginSuperAdmin = loginSuperAdmin;
// Bootstrap: crea el primer superadmin (no requiere autenticación previa)
const bootstrapSuperAdmin = async (req, res, next) => {
    try {
        const dto = superadmin_types_1.RegisterSuperAdminSchema.parse(req.body);
        const result = await (0, superadmin_service_1.bootstrapSuperAdminService)(dto);
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.bootstrapSuperAdmin = bootstrapSuperAdmin;
// Registrar superadmin adicional (requiere estar autenticado como superadmin)
const registrarSuperAdmin = async (req, res, next) => {
    try {
        const dto = superadmin_types_1.RegisterSuperAdminSchema.parse(req.body);
        const result = await (0, superadmin_service_1.registrarSuperAdminService)(dto, req.user.id);
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.registrarSuperAdmin = registrarSuperAdmin;
// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────
const listarTiendas = async (req, res, next) => {
    try {
        const { page, limit } = (0, pagination_1.parsePagination)(req);
        const { tiendas, total } = await (0, superadmin_service_1.listarTiendasService)(page, limit);
        (0, response_1.sendSuccess)(res, tiendas, 200, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listarTiendas = listarTiendas;
const obtenerTienda = async (req, res, next) => {
    try {
        const tienda = await (0, superadmin_service_1.obtenerTiendaService)(req.params['id']);
        (0, response_1.sendSuccess)(res, tienda);
    }
    catch (err) {
        next(err);
    }
};
exports.obtenerTienda = obtenerTienda;
const crearTienda = async (req, res, next) => {
    try {
        const dto = superadmin_types_1.CreateShopSchema.parse(req.body);
        const result = await (0, superadmin_service_1.crearTiendaService)(dto);
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.crearTienda = crearTienda;
const actualizarTienda = async (req, res, next) => {
    try {
        const dto = superadmin_types_1.UpdateShopSchema.parse(req.body);
        const tienda = await (0, superadmin_service_1.actualizarTiendaService)(req.params['id'], dto);
        (0, response_1.sendSuccess)(res, tienda);
    }
    catch (err) {
        next(err);
    }
};
exports.actualizarTienda = actualizarTienda;
const eliminarTienda = async (req, res, next) => {
    try {
        await (0, superadmin_service_1.eliminarTiendaService)(req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Tienda desactivada correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.eliminarTienda = eliminarTienda;
//# sourceMappingURL=superadmin.controller.js.map