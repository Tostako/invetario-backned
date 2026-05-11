import { ConflictError } from '../errors/AppError';

/**
 * Parsea errores de PostgreSQL (específicamente violaciones de UNIQUE code 23505)
 * para devolver un ConflictError con un mensaje y código más específico.
 */
export const handlePgConflict = (err: unknown, defaultMsg = 'Recurso ya existe'): never => {
  if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
    const detail = (err as any).detail || '';
    
    if (detail.includes('shop_slug')) {
      throw new ConflictError('El slug de la tienda ya está en uso', 'SHOP_SLUG_ALREADY_EXISTS');
    }
    if (detail.includes('shop_email')) {
      throw new ConflictError('El correo de la tienda ya está registrado', 'SHOP_EMAIL_ALREADY_EXISTS');
    }
    if (detail.includes('owner_email') || detail.includes('email')) {
      throw new ConflictError('El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS');
    }
    
    throw new ConflictError(defaultMsg, 'DUPLICATE_ENTRY');
  }
  
  throw err;
};
