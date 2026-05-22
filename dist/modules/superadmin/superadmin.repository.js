"use strict";
// ─── SuperAdmin Repository ────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/22_fn_superadmin.sql
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarTienda = exports.actualizarTienda = exports.crearTienda = exports.findTiendaById = exports.listarTiendas = exports.countSuperAdmins = exports.updateSuperAdminLastLogin = exports.createSuperAdmin = exports.findSuperAdminByEmail = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ─── Super Admins ─────────────────────────────────────────────────────────────
const findSuperAdminByEmail = async (email) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_buscar_superadmin_login($1)`, [email.toLowerCase()]);
    return result.rows[0] ?? null;
};
exports.findSuperAdminByEmail = findSuperAdminByEmail;
const createSuperAdmin = async (dto) => {
    const hashedPassword = await bcryptjs_1.default.hash(dto.password, 12);
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_superadmin($1, $2, $3)`, [dto.email.toLowerCase(), hashedPassword, dto.name]);
    return result.rows[0];
};
exports.createSuperAdmin = createSuperAdmin;
const updateSuperAdminLastLogin = (id) => (0, database_1.query)(`SELECT sp_actualizar_ultimo_login_superadmin($1)`, [id]).then(() => undefined);
exports.updateSuperAdminLastLogin = updateSuperAdminLastLogin;
const countSuperAdmins = async () => {
    const result = await (0, database_1.query)(`SELECT fn_contar_superadmins()`);
    return parseInt(result.rows[0].fn_contar_superadmins, 10);
};
exports.countSuperAdmins = countSuperAdmins;
// ─── Tiendas (CRUD global) ────────────────────────────────────────────────────
const listarTiendas = async (limit, offset) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_tiendas_admin($1, $2)`, [limit, offset]);
    return result.rows;
};
exports.listarTiendas = listarTiendas;
const findTiendaById = async (id) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_tienda_admin($1)`, [id]);
    return result.rows[0] ?? null;
};
exports.findTiendaById = findTiendaById;
const crearTienda = async (dto) => {
    const hashedPassword = await bcryptjs_1.default.hash(dto.owner_password, 12);
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_tienda_admin($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [
        dto.name,
        dto.slug,
        dto.email.toLowerCase(),
        dto.owner_name,
        dto.owner_email.toLowerCase(),
        hashedPassword,
        dto.phone ?? null,
        dto.address ?? null,
        dto.logo_url ?? null,
        dto.currency,
        dto.timezone,
        dto.plan,
    ]);
    return result.rows[0];
};
exports.crearTienda = crearTienda;
const actualizarTienda = async (id, dto) => {
    const result = await (0, database_1.query)(`SELECT id FROM sp_actualizar_tienda($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [
        id,
        dto.name ?? null,
        dto.email ?? null,
        dto.phone ?? null,
        dto.address ?? null,
        dto.logo_url ?? null,
        dto.currency ?? null,
        dto.timezone ?? null,
        dto.is_active ?? null,
        dto.plan ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.actualizarTienda = actualizarTienda;
const eliminarTienda = async (id) => {
    await (0, database_1.query)(`SELECT sp_desactivar_tienda($1)`, [id]);
};
exports.eliminarTienda = eliminarTienda;
//# sourceMappingURL=superadmin.repository.js.map