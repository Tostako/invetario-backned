"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../shared/errors/AppError");
const env_1 = require("../config/env");
// Error handler global — DEBE ser el último middleware registrado en app.ts.
// Captura cualquier error lanzado con next(err) o throw dentro de un handler async.
const errorHandler = (err, req, res, _next) => {
    // ── 0. Errores de subida de archivos (multer/storage) ───────────────────────
    const maybeMulter = err;
    if (maybeMulter.name === 'MulterError') {
        if (maybeMulter.code === 'LIMIT_FILE_SIZE') {
            res.locals['errorInfo'] = {
                code: 'IMAGE_TOO_LARGE',
                message: 'La imagen supera el tamaño máximo permitido (5MB).',
            };
            res.status(413).json({
                success: false,
                message: 'La imagen supera el tamaño máximo permitido (5MB).',
                code: 'IMAGE_TOO_LARGE',
            });
            return;
        }
        res.locals['errorInfo'] = {
            code: 'UPLOAD_ERROR',
            message: 'Error al procesar el archivo subido.',
            details: maybeMulter.message,
        };
        res.status(422).json({
            success: false,
            message: 'Error al procesar el archivo subido.',
            code: 'UPLOAD_ERROR',
        });
        return;
    }
    if (err.message.includes('Formato de imagen no permitido')) {
        res.locals['errorInfo'] = {
            code: 'INVALID_IMAGE_FORMAT',
            message: err.message,
        };
        res.status(422).json({
            success: false,
            message: err.message,
            code: 'INVALID_IMAGE_FORMAT',
        });
        return;
    }
    if (err.message.startsWith('Supabase Storage error:')) {
        logError(err, req);
        res.locals['errorInfo'] = {
            code: 'STORAGE_UPLOAD_FAILED',
            message: 'No se pudo subir la imagen al almacenamiento. Intenta nuevamente.',
            details: env_1.env.isDev ? err.message : undefined,
        };
        res.status(502).json({
            success: false,
            message: 'No se pudo subir la imagen al almacenamiento. Intenta nuevamente.',
            code: 'STORAGE_UPLOAD_FAILED',
        });
        return;
    }
    // ── 1. Errores de validación Zod (input inválido del cliente) ────────────────
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            received: 'received' in e ? e.received : undefined,
            expected: 'expected' in e ? e.expected : undefined,
        }));
        res.locals['errorInfo'] = {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            fields: errors.map((e) => `${e.field || 'body'}: ${e.message}`),
        };
        res.status(422).json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors,
        });
        return;
    }
    // ── 2. Errores operacionales conocidos (AppError y sus subclases) ────────────
    if (err instanceof AppError_1.AppError) {
        // Errores 5xx operacionales sí se loguean (son inesperados aunque controlados)
        if (err.statusCode >= 500) {
            logError(err, req);
        }
        res.locals['errorInfo'] = {
            code: err.errorCode,
            message: err.message,
        };
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.errorCode,
        });
        return;
    }
    // ── 3. Errores de PostgreSQL ──────────────────────────────────────────────────
    const pgError = err;
    if (pgError.code) {
        logError(err, req);
        // Violación de UNIQUE — ya manejada en services, pero por si acaso
        if (pgError.code === '23505') {
            res.locals['errorInfo'] = { code: 'DUPLICATE_ENTRY', message: 'Duplicate entry' };
            res.status(409).json({ success: false, message: 'Duplicate entry' });
            return;
        }
        // Violación de FK
        if (pgError.code === '23503') {
            res.locals['errorInfo'] = {
                code: 'REFERENCED_RESOURCE_NOT_FOUND',
                message: 'Referenced resource does not exist',
            };
            res.status(422).json({ success: false, message: 'Referenced resource does not exist' });
            return;
        }
        // Check constraint
        if (pgError.code === '23514') {
            res.locals['errorInfo'] = {
                code: 'DATABASE_CONSTRAINT_VIOLATION',
                message: 'Value violates a database constraint',
            };
            res.status(422).json({ success: false, message: 'Value violates a database constraint' });
            return;
        }
    }
    // ── 4. Cualquier otro error inesperado ────────────────────────────────────────
    logError(err, req);
    res.locals['errorInfo'] = {
        code: 'INTERNAL_SERVER_ERROR',
        message: env_1.env.isDev ? err.message : 'Internal server error',
    };
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(env_1.env.isDev && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
// Loguea errores con contexto suficiente para depurar en producción sin exponer datos al cliente
function logError(err, req) {
    const shopId = req.user?.shop_id ?? 'unauthenticated';
    if (env_1.env.isDev) {
        console.error(`[Error] ${err.name}: ${err.message}`, err.stack);
    }
    else {
        console.error(JSON.stringify({
            ts: new Date().toISOString(),
            level: 'error',
            name: err.name,
            message: err.message,
            method: req.method,
            url: req.originalUrl,
            shop_id: shopId,
        }));
    }
}
//# sourceMappingURL=errorHandler.js.map