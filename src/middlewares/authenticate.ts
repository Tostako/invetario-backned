import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, UserRole } from '../shared/types';
import { UnauthorizedError } from '../shared/errors/AppError';

// Payload que vive dentro del JWT
interface JwtPayload {
  sub: string;         // user.id o super_admin.id
  shop_id?: string;    // tenant — ausente en tokens de superadmin
  email: string;
  role: UserRole;
}

// Verifica el token, extrae el payload y lo adjunta a req.user
// El shop_id del token es la única fuente de verdad del tenant en la request.
// Para superadmin, shop_id no está presente en el token (se asigna '' en req.user).
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;

    if (!payload.sub || !payload.role) {
      throw new UnauthorizedError('Invalid token payload');
    }

    // Superadmin no tiene shop_id — todos los demás roles sí lo requieren
    if (payload.role !== 'superadmin' && !payload.shop_id) {
      throw new UnauthorizedError('Invalid token payload');
    }

    req.user = {
      id: payload.sub,
      shop_id: payload.shop_id ?? '',
      email: payload.email,
      role: payload.role,
      ...(payload.role === 'customer' && { customer_id: payload.sub }),
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw err;
  }
};
