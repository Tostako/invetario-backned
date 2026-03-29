import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { env } from '../config/env';

// Error handler global — DEBE ser el último middleware registrado en app.ts.
// Captura cualquier error lanzado con next(err) o throw dentro de un handler async.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── 1. Errores de validación Zod (input inválido del cliente) ────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // ── 2. Errores operacionales conocidos (AppError y sus subclases) ────────────
  if (err instanceof AppError) {
    // Errores 5xx operacionales sí se loguean (son inesperados aunque controlados)
    if (err.statusCode >= 500) {
      logError(err, req);
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ── 3. Errores de PostgreSQL ──────────────────────────────────────────────────
  const pgError = err as NodeJS.ErrnoException;
  if (pgError.code) {
    logError(err, req);

    // Violación de UNIQUE — ya manejada en services, pero por si acaso
    if (pgError.code === '23505') {
      res.status(409).json({ success: false, message: 'Duplicate entry' });
      return;
    }
    // Violación de FK
    if (pgError.code === '23503') {
      res.status(422).json({ success: false, message: 'Referenced resource does not exist' });
      return;
    }
    // Check constraint
    if (pgError.code === '23514') {
      res.status(422).json({ success: false, message: 'Value violates a database constraint' });
      return;
    }
  }

  // ── 4. Cualquier otro error inesperado ────────────────────────────────────────
  logError(err, req);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.isDev && { stack: err.stack }),
  });
};

// Loguea errores con contexto suficiente para depurar en producción sin exponer datos al cliente
function logError(err: Error, req: Request): void {
  const shopId = req.user?.shop_id ?? 'unauthenticated';

  if (env.isDev) {
    console.error(`[Error] ${err.name}: ${err.message}`, err.stack);
  } else {
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
