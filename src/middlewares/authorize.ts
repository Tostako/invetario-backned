import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../shared/types';
import { ForbiddenError } from '../shared/errors/AppError';

// Jerarquía de roles: superadmin > owner > admin > staff > customer
const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 10,
  owner: 3,
  admin: 2,
  staff: 1,
  customer: 0,
};

// Fábrica de middleware: restringe la ruta a roles con nivel >= el requerido
// Uso: router.delete('/:id', authenticate, authorize('admin'), controller.delete)
export const authorize = (...allowedRoles: UserRole[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userLevel = ROLE_HIERARCHY[req.user.role];
    const minRequired = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r]));

    if (userLevel < minRequired) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
