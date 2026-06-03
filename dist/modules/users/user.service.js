"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.desactivar2faService = exports.activar2faService = exports.configurar2faService = exports.revocarSesionService = exports.listarSesionesService = exports.actualizarPreferenciasService = exports.obtenerPreferenciasService = exports.cambiarPasswordService = exports.actualizarPerfilService = exports.obtenerPerfilService = exports.aPerfilPublico = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otplib_1 = require("otplib");
const AppError_1 = require("../../shared/errors/AppError");
const user_repository_1 = require("./user.repository");
const user_types_1 = require("./user.types");
const userSession_repository_1 = require("./userSession.repository");
const normalizarPreferencias = (raw) => {
    const o = typeof raw === 'object' && raw !== null && !Array.isArray(raw)
        ? raw
        : {};
    return {
        email_orders: Boolean(o['email_orders'] ?? user_types_1.PREFERENCIAS_DEFECTO.email_orders),
        email_low_stock: Boolean(o['email_low_stock'] ?? user_types_1.PREFERENCIAS_DEFECTO.email_low_stock),
        email_marketing: Boolean(o['email_marketing'] ?? user_types_1.PREFERENCIAS_DEFECTO.email_marketing),
        push_enabled: Boolean(o['push_enabled'] ?? user_types_1.PREFERENCIAS_DEFECTO.push_enabled),
    };
};
const aPerfilPublico = (u) => ({
    id: u.id,
    shop_id: u.shop_id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    is_active: u.is_active,
    two_factor_enabled: u.two_factor_enabled,
    last_login: u.last_login ? u.last_login.toISOString() : null,
    created_at: u.created_at.toISOString(),
    updated_at: u.updated_at.toISOString(),
});
exports.aPerfilPublico = aPerfilPublico;
const obtenerPerfilService = async (shopId, userId) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    return (0, exports.aPerfilPublico)(u);
};
exports.obtenerPerfilService = obtenerPerfilService;
const actualizarPerfilService = async (shopId, userId, dto) => {
    if (dto.email && (await (0, user_repository_1.emailUsuarioExisteEnTienda)(shopId, dto.email, userId))) {
        throw new AppError_1.ConflictError('Ya existe un usuario con ese email en esta tienda');
    }
    const u = await (0, user_repository_1.actualizarPerfilUsuario)(shopId, userId, dto);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    return (0, exports.aPerfilPublico)(u);
};
exports.actualizarPerfilService = actualizarPerfilService;
const cambiarPasswordService = async (shopId, userId, dto) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    const ok = await bcryptjs_1.default.compare(dto.current_password, u.password);
    if (!ok)
        throw new AppError_1.UnauthorizedError('Contraseña actual incorrecta');
    const hash = await bcryptjs_1.default.hash(dto.new_password, 12);
    await (0, user_repository_1.actualizarPasswordUsuario)(shopId, userId, hash);
};
exports.cambiarPasswordService = cambiarPasswordService;
const obtenerPreferenciasService = async (shopId, userId) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    return normalizarPreferencias(u.notification_preferences);
};
exports.obtenerPreferenciasService = obtenerPreferenciasService;
const actualizarPreferenciasService = async (shopId, userId, patch) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    const actual = normalizarPreferencias(u.notification_preferences);
    const siguiente = { ...actual, ...patch };
    await (0, user_repository_1.guardarPreferenciasNotificacion)(shopId, userId, siguiente);
    return siguiente;
};
exports.actualizarPreferenciasService = actualizarPreferenciasService;
const listarSesionesService = async (shopId, userId, jtiActual) => {
    const r = await (0, userSession_repository_1.listarSesionesUsuario)(userId, shopId);
    return r.rows.map((row) => ({
        id: row.id,
        created_at: row.created_at.toISOString(),
        last_seen_at: row.last_seen_at.toISOString(),
        user_agent: row.user_agent,
        ip_address: row.ip_address,
        revocada: row.revoked_at != null,
        sesion_actual: Boolean(jtiActual && row.jti === jtiActual && row.revoked_at == null),
    }));
};
exports.listarSesionesService = listarSesionesService;
const revocarSesionService = async (shopId, userId, sessionId) => {
    const ok = await (0, userSession_repository_1.revocarSesion)(userId, shopId, sessionId);
    if (!ok)
        throw new AppError_1.NotFoundError('Sesión');
};
exports.revocarSesionService = revocarSesionService;
const configurar2faService = async (shopId, userId) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    if (u.two_factor_enabled) {
        throw new AppError_1.ConflictError('El 2FA ya está activo. Desactívelo antes de generar un nuevo enlace.');
    }
    const secret = (0, otplib_1.generateSecret)();
    await (0, user_repository_1.guardarPending2fa)(shopId, userId, secret);
    const issuer = 'InventarioTiendas';
    const otpauth_url = (0, otplib_1.generateURI)({
        issuer,
        label: `${issuer}:${u.email}`,
        secret,
    });
    return { secret, otpauth_url };
};
exports.configurar2faService = configurar2faService;
const activar2faService = async (shopId, userId, code) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    const pending = u.two_factor_pending_secret;
    if (!pending) {
        throw new AppError_1.ValidationError('No hay configuración 2FA pendiente. Ejecute primero POST /users/me/2fa/setup');
    }
    const result = (0, otplib_1.verifySync)({ secret: pending, token: code });
    if (!result.valid) {
        throw new AppError_1.ValidationError('Código de autenticación inválido');
    }
    await (0, user_repository_1.activar2faUsuario)(shopId, userId, pending);
    return { two_factor_enabled: true };
};
exports.activar2faService = activar2faService;
const desactivar2faService = async (shopId, userId, password) => {
    const u = await (0, user_repository_1.obtenerUsuarioCompleto)(shopId, userId);
    if (!u)
        throw new AppError_1.NotFoundError('Usuario');
    const ok = await bcryptjs_1.default.compare(password, u.password);
    if (!ok)
        throw new AppError_1.UnauthorizedError('Contraseña incorrecta');
    await (0, user_repository_1.desactivar2faUsuario)(shopId, userId);
    return { two_factor_enabled: false };
};
exports.desactivar2faService = desactivar2faService;
//# sourceMappingURL=user.service.js.map