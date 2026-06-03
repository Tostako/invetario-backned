"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePgConflict = void 0;
const AppError_1 = require("../errors/AppError");
/**
 * Parsea errores de PostgreSQL (específicamente violaciones de UNIQUE code 23505)
 * para devolver un ConflictError con un mensaje y código más específico.
 */
const handlePgConflict = (err, defaultMsg = 'Recurso ya existe') => {
    if (err instanceof Error && 'code' in err && err.code === '23505') {
        const detail = err.detail || '';
        if (detail.includes('shop_slug')) {
            throw new AppError_1.ConflictError('El slug de la tienda ya está en uso', 'SHOP_SLUG_ALREADY_EXISTS');
        }
        if (detail.includes('shop_email')) {
            throw new AppError_1.ConflictError('El correo de la tienda ya está registrado', 'SHOP_EMAIL_ALREADY_EXISTS');
        }
        if (detail.includes('owner_email') || detail.includes('email')) {
            throw new AppError_1.ConflictError('El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS');
        }
        throw new AppError_1.ConflictError(defaultMsg, 'DUPLICATE_ENTRY');
    }
    throw err;
};
exports.handlePgConflict = handlePgConflict;
//# sourceMappingURL=errors.js.map