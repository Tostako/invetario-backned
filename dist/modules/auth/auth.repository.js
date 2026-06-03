"use strict";
// ─── Auth Repository ─────────────────────────────────────────────────────────
// Thin adapter: solo invoca funciones/procedimientos de la BD.
// Sin SQL ad-hoc — toda la lógica de persistencia vive en:
//   database/16_fn_auth.sql
//
// El hashing bcrypt ocurre en Node.js (bcrypt no es nativo en PostgreSQL).
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShopForExistingUser = exports.updateCustomerLastLogin = exports.createCustomer = exports.findCustomerByEmailAndShop = exports.updateLastLogin = exports.createShopWithOwner = exports.findUserByIdAndShop = exports.findUsersByEmail = exports.findUserByEmailAndShop = void 0;
const database_1 = require("../../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ─── Usuarios (staff/owner) ───────────────────────────────────────────────────
const findUserByEmailAndShop = async (email, shopSlug) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_buscar_usuario_login($1, $2)`, [email.toLowerCase(), shopSlug]);
    return result.rows[0] ?? null;
};
exports.findUserByEmailAndShop = findUserByEmailAndShop;
const findUsersByEmail = async (email) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_buscar_usuarios_por_email($1)`, [email.toLowerCase()]);
    return result.rows;
};
exports.findUsersByEmail = findUsersByEmail;
const findUserByIdAndShop = async (userId, shopId) => {
    const result = await (0, database_1.query)(`SELECT id, shop_id, email, name, role, is_active FROM users WHERE id = $1 AND shop_id = $2`, [userId, shopId]);
    return result.rows[0] ?? null;
};
exports.findUserByIdAndShop = findUserByIdAndShop;
const createShopWithOwner = async (dto) => {
    const hashedPassword = await bcryptjs_1.default.hash(dto.password, 12);
    const result = await (0, database_1.query)(`SELECT * FROM sp_registrar_tienda($1, $2, $3, $4, $5, $6)`, [
        dto.shop_name,
        dto.shop_slug,
        dto.shop_email.toLowerCase(),
        dto.owner_name,
        dto.owner_email.toLowerCase(),
        hashedPassword,
    ]);
    const row = result.rows[0];
    return { shopId: row.shop_id, userId: row.user_id };
};
exports.createShopWithOwner = createShopWithOwner;
const updateLastLogin = (userId) => (0, database_1.query)(`SELECT sp_actualizar_ultimo_login_usuario($1)`, [userId]).then(() => undefined);
exports.updateLastLogin = updateLastLogin;
// ─── Customers ────────────────────────────────────────────────────────────────
const findCustomerByEmailAndShop = async (email, shopSlug) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_buscar_customer_login($1, $2)`, [email.toLowerCase(), shopSlug]);
    return result.rows[0] ?? null;
};
exports.findCustomerByEmailAndShop = findCustomerByEmailAndShop;
const createCustomer = async (dto) => {
    const hashedPassword = await bcryptjs_1.default.hash(dto.password, 12);
    const result = await (0, database_1.query)(`SELECT * FROM sp_registrar_customer($1, $2, $3, $4, $5, $6)`, [
        dto.shop_slug,
        dto.name,
        dto.email.toLowerCase(),
        hashedPassword,
        dto.phone ?? null,
        dto.address ?? null,
    ]);
    const row = result.rows[0];
    return { shopId: row.shop_id, customerId: row.customer_id };
};
exports.createCustomer = createCustomer;
const updateCustomerLastLogin = (customerId) => (0, database_1.query)(`SELECT sp_actualizar_ultimo_login_customer($1)`, [customerId]).then(() => undefined);
exports.updateCustomerLastLogin = updateCustomerLastLogin;
const createShopForExistingUser = async (userId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_tienda_para_user_existente($1, $2, $3, $4)`, [
        dto.shop_name,
        dto.shop_slug,
        dto.shop_email.toLowerCase(),
        userId,
    ]);
    const row = result.rows[0];
    return { shopId: row.shop_id, userId: row.user_id };
};
exports.createShopForExistingUser = createShopForExistingUser;
//# sourceMappingURL=auth.repository.js.map