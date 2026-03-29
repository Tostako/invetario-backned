import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/types';
import {
  findUserByEmailAndShop,
  createShopWithOwner,
  updateLastLogin,
} from './auth.repository';
import { LoginDto, RegisterShopDto } from './auth.types';

// Genera el JWT con shop_id embebido — esto es lo que todos los middlewares validan
const signToken = (payload: {
  sub: string;
  shop_id: string;
  email: string;
  role: UserRole;
}): string =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);

export const loginService = async (dto: LoginDto) => {
  const user = await findUserByEmailAndShop(dto.email, dto.shop_slug);

  if (!user) {
    // Mismo mensaje para email no encontrado y password incorrecta (evita user enumeration)
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is disabled');
  }

  const passwordMatch = await bcrypt.compare(dto.password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  await updateLastLogin(user.id);

  const token = signToken({
    sub: user.id,
    shop_id: user.shop_id,
    email: user.email,
    role: user.role as UserRole,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const registerShopService = async (dto: RegisterShopDto) => {
  try {
    const { shopId, userId } = await createShopWithOwner(dto);

    const token = signToken({
      sub: userId,
      shop_id: shopId,
      email: dto.owner_email,
      role: 'owner',
    });

    return { token, shopId, userId };
  } catch (err: unknown) {
    // Violación de UNIQUE (slug o email duplicado)
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === '23505'
    ) {
      throw new ConflictError('Shop slug or email already exists');
    }
    throw err;
  }
};
