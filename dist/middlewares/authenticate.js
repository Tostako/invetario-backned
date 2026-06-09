"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../shared/errors/AppError");
const userSession_repository_1 = require("../modules/users/userSession.repository");
const rolesConSesionEnBd = ['owner', 'admin', 'staff'];
// Verifica el token, extrae el payload y lo adjunta a req.user.
// Tokens de empleados con `jti` validan sesión activa en user_sessions (revocación).
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError_1.UnauthorizedError('Missing or malformed authorization header', 'MISSING_TOKEN');
        }
        const token = authHeader.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.secret);
        if (!payload.sub || !payload.email) {
            throw new AppError_1.UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
        }
        // Token intermedio post-login (elegir tienda)
        if (payload.sub === 'pending') {
            req.user = {
                id: 'pending',
                shop_id: '',
                email: payload.email,
                role: 'staff',
            };
            next();
            return;
        }
        if (!payload.role) {
            throw new AppError_1.UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
        }
        if (payload.role !== 'superadmin' && !payload.shop_id) {
            throw new AppError_1.UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
        }
        req.user = {
            id: payload.sub,
            shop_id: payload.shop_id ?? '',
            email: payload.email,
            role: payload.role,
            jti: payload.jti,
            ...(payload.role === 'customer' && { customer_id: payload.sub }),
        };
        if (payload.jti &&
            payload.shop_id &&
            rolesConSesionEnBd.includes(payload.role)) {
            const ok = await (0, userSession_repository_1.sesionActivaPorJti)(payload.sub, payload.shop_id, payload.jti);
            if (!ok) {
                throw new AppError_1.UnauthorizedError('Session revoked', 'SESSION_REVOKED');
            }
        }
        next();
    }
    catch (err) {
        if (err instanceof AppError_1.UnauthorizedError) {
            next(err);
            return;
        }
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new AppError_1.UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
            return;
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new AppError_1.UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
            return;
        }
        next(err);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map