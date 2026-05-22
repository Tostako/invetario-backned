export declare class AppError extends Error {
    readonly message: string;
    readonly statusCode: number;
    readonly errorCode?: string | undefined;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, errorCode?: string | undefined, isOperational?: boolean);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, errorCode?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class BadRequestError extends AppError {
    constructor(message: string, errorCode?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string, errorCode?: string);
}
//# sourceMappingURL=AppError.d.ts.map