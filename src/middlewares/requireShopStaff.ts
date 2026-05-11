import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';
import { ForbiddenError } from '../shared/errors/AppError';

/** Solo empleados de tienda (owner, admin, staff). Excluye customer y superadmin. */
export const requireShopStaff = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const r = req.user.role;
  if (r === 'customer' || r === 'superadmin') {
    throw new ForbiddenError('Este recurso solo está disponible para usuarios de la tienda');
  }
  next();
};
