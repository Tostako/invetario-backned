import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para endpoints públicos (sin autenticación).
 * Resuelve shop_id a partir de shop_slug en query params.
 * Simula un req.user mínimo para que los controllers/services existentes funcionen.
 *
 * Uso: app.get('/api/v1/public/...', publicShopResolver, controller)
 */
export declare const publicShopResolver: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=publicShopResolver.d.ts.map