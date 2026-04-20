import { AppError } from '../errors/AppError';

// ─── Traductor de errores de Base de Datos ───────────────────────────────────
// Convierte excepciones de PostgreSQL (lanzadas por stored procedures)
// en AppErrors con mensajes claros para el cliente HTTP.
//
// Convención de mensajes de error en los stored procedures:
//   RAISE EXCEPTION 'CODIGO_ERROR:detalles' USING ERRCODE = 'P0001' | 'P0002' | '23505'
//
// Uso:
//   throw traducirErrorDB(err, {
//     PRODUCT_NOT_FOUND: () => new NotFoundError('Producto'),
//     SKU_DUPLICADO: (msg) => new ConflictError(`SKU "${msg.split(':')[1]}" ya existe`),
//   });

type Manejadores = Record<string, (mensaje: string) => AppError>;

export const traducirErrorDB = (err: unknown, manejadores: Manejadores): AppError => {
  if (err instanceof AppError) {
    // Ya es un AppError (p.ej. NotFoundError lanzado antes del try/catch)
    return err;
  }

  if (err instanceof Error) {
    const mensaje = err.message;

    // Buscar el código de error en los manejadores registrados
    for (const codigo of Object.keys(manejadores)) {
      if (mensaje.startsWith(codigo)) {
        return manejadores[codigo]!(mensaje);
      }
    }
  }

  // Si no coincide ningún manejador, relanzar sin modificar
  throw err;
};
