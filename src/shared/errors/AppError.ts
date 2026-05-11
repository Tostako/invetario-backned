// Error personalizado que transporta el código HTTP junto al mensaje
// Permite que el error handler global responda sin lógica adicional
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode?: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
    this.name = 'ConflictError';
  }
}
