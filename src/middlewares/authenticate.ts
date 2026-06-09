import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, UserRole } from '../shared/types';
import { UnauthorizedError } from '../shared/errors/AppError';
import { sesionActivaPorJti } from '../modules/users/userSession.repository';
import {
  ensureCustomerForShopUser,
  findCustomerIdByEmailAndShop,
} from '../modules/auth/auth.repository';

// Payload que vive dentro del JWT
interface JwtPayload {
  sub: string;
  shop_id?: string;
  email: string;
  role?: UserRole;
  jti?: string;
  customer_id?: string;
}

const rolesConSesionEnBd: UserRole[] = ['owner', 'admin', 'staff'];
const rolesConCustomerId: UserRole[] = ['customer', 'owner', 'admin', 'staff'];

const resolverCustomerId = async (payload: JwtPayload): Promise<string | undefined> => {
  if (payload.role === 'customer') return payload.sub;
  if (!payload.role || !rolesConCustomerId.includes(payload.role) || !payload.shop_id) {
    return undefined;
  }
  if (payload.customer_id) return payload.customer_id;

  const existente = await findCustomerIdByEmailAndShop(payload.email, payload.shop_id);
  if (existente) return existente;

  return ensureCustomerForShopUser(payload.shop_id, payload.email, payload.email.split('@')[0] ?? 'Customer');
};

// Verifica el token, extrae el payload y lo adjunta a req.user.
// Tokens de empleados con `jti` validan sesión activa en user_sessions (revocación).
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed authorization header', 'MISSING_TOKEN');
    }

    const token = authHeader.slice(7);

    const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    // Token intermedio post-login (elegir tienda)
    if (payload.sub === 'pending') {
      req.user = {
        id: 'pending',
        shop_id: '',
        email: payload.email,
        role: 'staff',
      };
      next();
      return;
    }

    if (!payload.role) {
      throw new UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    if (payload.role !== 'superadmin' && !payload.shop_id) {
      throw new UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    const customerId = await resolverCustomerId(payload);

    req.user = {
      id: payload.sub,
      shop_id: payload.shop_id ?? '',
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      ...(customerId && { customer_id: customerId }),
    };

    if (
      payload.jti &&
      payload.shop_id &&
      rolesConSesionEnBd.includes(payload.role)
    ) {
      const ok = await sesionActivaPorJti(payload.sub, payload.shop_id, payload.jti);
      if (!ok) {
        throw new UnauthorizedError('Session revoked', 'SESSION_REVOKED');
      }
    }

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
      return;
    }
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
      return;
    }
    next(err);
  }
};
