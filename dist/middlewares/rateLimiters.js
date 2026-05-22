"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiter estricto para endpoints de autenticación.
// Limita intentos de brute-force en login sin necesidad de bloquear IPs globalmente.
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 intentos por IP por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación. Por favor, inténtalo de nuevo en 5 minutos.',
    },
    // Distinguir por IP: evita que un atacante bloquee a otro usuario legítimo
    keyGenerator: (req) => req.ip ?? 'unknown',
});
// Rate limiter general de la API (más permisivo)
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down.',
    },
});
//# sourceMappingURL=rateLimiters.js.map