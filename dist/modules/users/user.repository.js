"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.desactivar2faUsuario = exports.activar2faUsuario = exports.guardarPending2fa = exports.guardarPreferenciasNotificacion = exports.actualizarPasswordUsuario = exports.actualizarPerfilUsuario = exports.emailUsuarioExisteEnTienda = exports.obtenerUsuarioCompleto = void 0;
const database_1 = require("../../config/database");
const obtenerUsuarioCompleto = async (shopId, userId) => {
    const r = await (0, database_1.query)(`SELECT id, shop_id, name, email, phone, password, role, is_active,
            notification_preferences, two_factor_enabled, two_factor_secret,
            two_factor_pending_secret, last_login, created_at, updated_at
     FROM users WHERE id = $1 AND shop_id = $2`, [userId, shopId]);
    return r.rows[0] ?? null;
};
exports.obtenerUsuarioCompleto = obtenerUsuarioCompleto;
const emailUsuarioExisteEnTienda = async (shopId, email, excludeUserId) => {
    const r = await (0, database_1.query)(`SELECT COUNT(*)::text AS c FROM users
     WHERE shop_id = $1 AND lower(email::text) = $2 AND id != $3`, [shopId, email.toLowerCase(), excludeUserId]);
    return parseInt(r.rows[0].c, 10) > 0;
};
exports.emailUsuarioExisteEnTienda = emailUsuarioExisteEnTienda;
const actualizarPerfilUsuario = async (shopId, userId, dto) => {
    const sets = [];
    const vals = [];
    let i = 1;
    if (dto.name !== undefined) {
        sets.push(`name = $${i++}`);
        vals.push(dto.name);
    }
    if (dto.email !== undefined) {
        sets.push(`email = $${i++}`);
        vals.push(dto.email.toLowerCase());
    }
    if (dto.phone !== undefined) {
        sets.push(`phone = $${i++}`);
        vals.push(dto.phone);
    }
    vals.push(userId, shopId);
    const r = await (0, database_1.query)(`UPDATE users SET ${sets.join(', ')}
     WHERE id = $${i++} AND shop_id = $${i}
     RETURNING id, shop_id, name, email, phone, password, role, is_active,
               notification_preferences, two_factor_enabled, two_factor_secret,
               two_factor_pending_secret, last_login, created_at, updated_at`, vals);
    return r.rows[0] ?? null;
};
exports.actualizarPerfilUsuario = actualizarPerfilUsuario;
const actualizarPasswordUsuario = async (shopId, userId, passwordHash) => {
    await (0, database_1.query)(`UPDATE users SET password = $3 WHERE id = $2 AND shop_id = $1`, [
        shopId,
        userId,
        passwordHash,
    ]);
};
exports.actualizarPasswordUsuario = actualizarPasswordUsuario;
const guardarPreferenciasNotificacion = async (shopId, userId, prefs) => {
    await (0, database_1.query)(`UPDATE users SET notification_preferences = $3::jsonb WHERE id = $2 AND shop_id = $1`, [
        shopId,
        userId,
        JSON.stringify(prefs),
    ]);
};
exports.guardarPreferenciasNotificacion = guardarPreferenciasNotificacion;
const guardarPending2fa = async (shopId, userId, pendingSecret) => {
    await (0, database_1.query)(`UPDATE users SET two_factor_pending_secret = $3 WHERE id = $2 AND shop_id = $1`, [shopId, userId, pendingSecret]);
};
exports.guardarPending2fa = guardarPending2fa;
const activar2faUsuario = async (shopId, userId, secret) => {
    await (0, database_1.query)(`UPDATE users SET
       two_factor_secret = $3,
       two_factor_pending_secret = NULL,
       two_factor_enabled = TRUE
     WHERE id = $2 AND shop_id = $1`, [shopId, userId, secret]);
};
exports.activar2faUsuario = activar2faUsuario;
const desactivar2faUsuario = async (shopId, userId) => {
    await (0, database_1.query)(`UPDATE users SET
       two_factor_enabled = FALSE,
       two_factor_secret = NULL,
       two_factor_pending_secret = NULL
     WHERE id = $2 AND shop_id = $1`, [shopId, userId]);
};
exports.desactivar2faUsuario = desactivar2faUsuario;
//# sourceMappingURL=user.repository.js.map