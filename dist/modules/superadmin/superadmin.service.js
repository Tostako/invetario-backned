"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTiendaService = exports.actualizarTiendaService = exports.crearTiendaService = exports.obtenerTiendaService = exports.listarTiendasService = exports.bootstrapSuperAdminService = exports.registrarSuperAdminService = exports.loginSuperAdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../shared/errors/AppError");
const superadmin_repository_1 = require("./superadmin.repository");
const pagination_1 = require("../../shared/utils/pagination");
const errors_1 = require("../../shared/utils/errors");
// Token de superadmin sin shop_id — el middleware lo acepta por el rol
const signSuperAdminToken = (id, email) => jsonwebtoken_1.default.sign({ sub: id, email, role: 'superadmin' }, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.expiresIn });
// ─── Auth ─────────────────────────────────────────────────────────────────────
const loginSuperAdminService = async (dto) => {
    const admin = await (0, superadmin_repository_1.findSuperAdminByEmail)(dto.email);
    if (!admin) {
        throw new AppError_1.UnauthorizedError('Credenciales inválidas');
    }
    if (!admin.is_active) {
        throw new AppError_1.UnauthorizedError('Cuenta deshabilitada');
    }
    const passwordMatch = await bcryptjs_1.default.compare(dto.password, admin.password);
    if (!passwordMatch) {
        throw new AppError_1.UnauthorizedError('Credenciales inválidas');
    }
    await (0, superadmin_repository_1.updateSuperAdminLastLogin)(admin.id);
    const token = signSuperAdminToken(admin.id, admin.email);
    return {
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email },
    };
};
exports.loginSuperAdminService = loginSuperAdminService;
const registrarSuperAdminService = async (dto, solicitanteId) => {
    // Solo el primer superadmin puede crearse sin restricción (bootstrap).
    // Los siguientes requieren que quien llama sea un superadmin activo (se
    // valida en el middleware de authorize antes de llegar aquí).
    // Este servicio no necesita verificar el rol: la ruta ya lo hace.
    // Se expone el solicitanteId por trazabilidad futura.
    void solicitanteId;
    try {
        const admin = await (0, superadmin_repository_1.createSuperAdmin)(dto);
        const token = signSuperAdminToken(admin.id, dto.email);
        return { token, adminId: admin.id };
    }
    catch (err) {
        (0, errors_1.handlePgConflict)(err, 'Email ya existe');
    }
};
exports.registrarSuperAdminService = registrarSuperAdminService;
// Bootstrap: crea el primer superadmin (solo funciona si no hay ninguno aún)
const bootstrapSuperAdminService = async (dto) => {
    const total = await (0, superadmin_repository_1.countSuperAdmins)();
    if (total > 0) {
        throw new AppError_1.ForbiddenError('Bootstrap deshabilitado: ya existen superadmins');
    }
    try {
        const admin = await (0, superadmin_repository_1.createSuperAdmin)(dto);
        const token = signSuperAdminToken(admin.id, dto.email);
        return { token, adminId: admin.id };
    }
    catch (err) {
        (0, errors_1.handlePgConflict)(err, 'Email ya existe');
    }
};
exports.bootstrapSuperAdminService = bootstrapSuperAdminService;
// ─── CRUD Tiendas ─────────────────────────────────────────────────────────────
const listarTiendasService = async (page, limit) => {
    const offset = (0, pagination_1.calcOffset)({ page, limit });
    const rows = await (0, superadmin_repository_1.listarTiendas)(limit, offset);
    const total = rows.length > 0 ? parseInt(rows[0].total, 10) : 0;
    return { tiendas: rows.map(({ total: _, ...t }) => t), total };
};
exports.listarTiendasService = listarTiendasService;
const obtenerTiendaService = async (id) => {
    const tienda = await (0, superadmin_repository_1.findTiendaById)(id);
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    return tienda;
};
exports.obtenerTiendaService = obtenerTiendaService;
const crearTiendaService = async (dto) => {
    try {
        return await (0, superadmin_repository_1.crearTienda)(dto);
    }
    catch (err) {
        (0, errors_1.handlePgConflict)(err, 'El slug o email de la tienda ya existe');
    }
};
exports.crearTiendaService = crearTiendaService;
const actualizarTiendaService = async (id, dto) => {
    const tienda = await (0, superadmin_repository_1.findTiendaById)(id);
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    const actualizada = await (0, superadmin_repository_1.actualizarTienda)(id, dto);
    if (!actualizada)
        throw new AppError_1.NotFoundError('Tienda');
    return (0, superadmin_repository_1.findTiendaById)(id);
};
exports.actualizarTiendaService = actualizarTiendaService;
const eliminarTiendaService = async (id) => {
    const tienda = await (0, superadmin_repository_1.findTiendaById)(id);
    if (!tienda)
        throw new AppError_1.NotFoundError('Tienda');
    await (0, superadmin_repository_1.eliminarTienda)(id);
};
exports.eliminarTiendaService = eliminarTiendaService;
//# sourceMappingURL=superadmin.service.js.map