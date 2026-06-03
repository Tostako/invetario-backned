import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { ForbiddenError } from '../shared/errors/AppError';
import { esUuidV4 } from '../shared/utils/uuidV4';

// Verifica que la tienda del token sigue existiendo y está activa.
// Se ejecuta DESPUÉS de authenticate. Protege contra:
//   - Tiendas desactivadas por impago o suspensión
//   - Tokens válidos de tenants eliminados
//
// Para evitar una query a DB en cada request se puede añadir caché
// (p. ej. node-cache con TTL de 60s) cuando la escala lo justifique.
export const tenantGuard = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shopId = req.user?.shop_id;

    if (!shopId || !esUuidV4(shopId)) {
      throw new ForbiddenError('Invalid or missing shop identifier');
    }

    const result = await query<{ is_active: boolean }>(
      'SELECT is_active FROM shops WHERE id = $1',
      [shopId]
    );

    const shop = result.rows[0];

    if (!shop) {
      throw new ForbiddenError('Shop not found');
    }

    if (!shop.is_active) {
      throw new ForbiddenError('Shop is suspended');
    }

    next();
  } catch (err) {
    next(err);
  }
};
