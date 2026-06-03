"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.BadRequestError = exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
// Error personalizado que transporta el código HTTP junto al mensaje
// Permite que el error handler global responda sin lógica adicional
class AppError extends Error {
    constructor(message, statusCode = 500, errorCode, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 422, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class BadRequestError extends AppError {
    constructor(message, errorCode = 'BAD_REQUEST') {
        super(message, 400, errorCode);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends AppError {
    constructor(message, errorCode = 'CONFLICT') {
        super(message, 409, errorCode);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=AppError.js.map