"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revocarSesion = exports.listarSesionesUsuario = exports.sesionActivaPorJti = exports.crearSesionUsuario = void 0;
const database_1 = require("../../config/database");
const crearSesionUsuario = async (p) => {
    await (0, database_1.query)(`INSERT INTO user_sessions (user_id, shop_id, jti, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`, [p.userId, p.shopId, p.jti, p.userAgent, p.ipAddress]);
};
exports.crearSesionUsuario = crearSesionUsuario;
const sesionActivaPorJti = async (userId, shopId, jti) => {
    const r = await (0, database_1.query)(`SELECT EXISTS (
       SELECT 1 FROM user_sessions
       WHERE user_id = $1 AND shop_id = $2 AND jti = $3 AND revoked_at IS NULL
     ) AS ok`, [userId, shopId, jti]);
    return r.rows[0]?.ok === true;
};
exports.sesionActivaPorJti = sesionActivaPorJti;
const listarSesionesUsuario = async (userId, shopId) => {
    return (0, database_1.query)(`SELECT id, created_at, last_seen_at, user_agent, ip_address, revoked_at, jti
     FROM user_sessions
     WHERE user_id = $1 AND shop_id = $2
     ORDER BY created_at DESC
     LIMIT 50`, [userId, shopId]);
};
exports.listarSesionesUsuario = listarSesionesUsuario;
const revocarSesion = async (userId, shopId, sessionId) => {
    const r = await (0, database_1.query)(`UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE id = $1 AND user_id = $2 AND shop_id = $3 AND revoked_at IS NULL`, [sessionId, userId, shopId]);
    return (r.rowCount ?? 0) > 0;
};
exports.revocarSesion = revocarSesion;
//# sourceMappingURL=userSession.repository.js.map