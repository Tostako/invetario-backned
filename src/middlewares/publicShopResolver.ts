import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { BadRequestError, NotFoundError } from '../shared/errors/AppError';

/**
 * Middleware para endpoints públicos (sin autenticación).
 * Resuelve shop_id a partir de shop_slug en query params.
 * Simula un req.user mínimo para que los controllers/services existentes funcionen.
 *
 * Uso: app.get('/api/v1/public/...', publicShopResolver, controller)
 */
export const publicShopResolver = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const shopSlug = req.query['shop_slug'] as string | undefined;

    if (!shopSlug || typeof shopSlug !== 'string') {
      throw new BadRequestError('Query param "shop_slug" is required');
    }

    const result = await query<{ id: string; is_active: boolean }>(
      'SELECT id, is_active FROM shops WHERE slug = $1',
      [shopSlug.toLowerCase()]
    );

    const shop = result.rows[0];

    if (!shop) {
      throw new NotFoundError('Shop');
    }

    if (!shop.is_active) {
      throw new BadRequestError('Shop is suspended');
    }

    // Simular un req.user mínimo para reutilizar services/controllers
    req.user = {
      id: 'public',
      shop_id: shop.id,
      email: 'public@visitor.com',
      role: 'staff', // rol neutro que puede leer
    };

    next();
  } catch (err) {
    next(err);
  }
};
