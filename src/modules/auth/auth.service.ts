import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/types';
import {
  findUserByEmailAndShop,
  createShopWithOwner,
  updateLastLogin,
  findCustomerByEmailAndShop,
  createCustomer,
  updateCustomerLastLogin,
  findUsersByEmail,
} from './auth.repository';
import { crearSesionUsuario } from '../users/userSession.repository';
import { LoginDto, RegisterShopDto, LoginCustomerDto, RegisterCustomerDto, CreateAdditionalShopDto } from './auth.types';

export type SessionMeta = { userAgent: string | null; ipAddress: string | null };

// Genera el JWT con shop_id embebido — esto es lo que todos los middlewares validan
const signToken = (payload: {
  sub: string;
  shop_id?: string;
  email: string;
  role?: UserRole;
  jti?: string;
}): string =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);

export const firmarTokenConSesionOpcional = async (
  base: { sub: string; shop_id: string; email: string; role: UserRole },
  sessionMeta?: SessionMeta
): Promise<string> => {
  const jti = randomUUID();
  const token = signToken({ ...base, jti });
  await crearSesionUsuario({
    userId: base.sub,
    shopId: base.shop_id,
    jti,
    userAgent: sessionMeta?.userAgent ?? null,
    ipAddress: sessionMeta?.ipAddress ?? null,
  });
  return token;
};

export const loginService = async (dto: LoginDto) => {
  const users = await findUsersByEmail(dto.email);

  if (users.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verificamos password contra el primer usuario encontrado (asumimos misma pwd para el mismo email)
  const passwordMatch = await bcrypt.compare(dto.password, users[0]!.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Filtramos solo tiendas activas
  const activeShops = users.filter(u => u.is_active);
  if (activeShops.length === 0) {
    throw new UnauthorizedError('Account is disabled');
  }

  // Generamos un token temporal que solo contiene el email
  const token = signToken({
    sub: 'pending',
    email: dto.email,
  });

  return {
    token,
    shops: activeShops.map(u => ({
      shop_id: u.shop_id,
      shop_name: u.shop_name,
      shop_slug: u.shop_slug,
      role: u.role,
    })),
  };
};

export const selectShopService = async (
  email: string,
  shopId: string,
  sessionMeta?: SessionMeta
) => {
  const users = await findUsersByEmail(email);
  const userInShop = users.find(u => u.shop_id === shopId);

  if (!userInShop) {
    throw new UnauthorizedError('User does not belong to this shop');
  }

  if (!userInShop.is_active) {
    throw new UnauthorizedError('Account is disabled for this shop');
  }

  await updateLastLogin(userInShop.user_id);

  const jti = randomUUID();
  const token = signToken({
    sub: userInShop.user_id,
    shop_id: userInShop.shop_id,
    email: email,
    role: userInShop.role as UserRole,
    jti,
  });

  await crearSesionUsuario({
    userId: userInShop.user_id,
    shopId: userInShop.shop_id,
    jti,
    userAgent: sessionMeta?.userAgent ?? null,
    ipAddress: sessionMeta?.ipAddress ?? null,
  });

  return {
    token,
    user: {
      id: userInShop.user_id,
      name: userInShop.user_name,
      email: email,
      role: userInShop.role,
    },
  };
};

export const registerShopService = async (dto: RegisterShopDto, sessionMeta?: SessionMeta) => {
  try {
    const { shopId, userId } = await createShopWithOwner(dto);

    const jti = randomUUID();
    const token = signToken({
      sub: userId,
      shop_id: shopId,
      email: dto.owner_email,
      role: 'owner',
      jti,
    });

    await crearSesionUsuario({
      userId,
      shopId,
      jti,
      userAgent: sessionMeta?.userAgent ?? null,
      ipAddress: sessionMeta?.ipAddress ?? null,
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

export const loginCustomerService = async (dto: LoginCustomerDto) => {
  const customer = await findCustomerByEmailAndShop(dto.email, dto.shop_slug);

  if (!customer || !customer.password) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!customer.is_active) {
    throw new UnauthorizedError('Account is disabled');
  }

  const passwordMatch = await bcrypt.compare(dto.password, customer.password);
  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  await updateCustomerLastLogin(customer.id);

  const token = signToken({
    sub: customer.id,
    shop_id: customer.shop_id,
    email: customer.email,
    role: 'customer',
  });

  return {
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
  };
};

export const registerCustomerService = async (dto: RegisterCustomerDto) => {
  try {
    const { shopId, customerId } = await createCustomer(dto);

    const token = signToken({
      sub: customerId,
      shop_id: shopId,
      email: dto.email,
      role: 'customer',
    });

    return {
      token,
      customer: {
        id: customerId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
    };
  } catch (err: unknown) {
    // Violación de UNIQUE (email duplicado en la misma tienda)
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === '23505'
    ) {
      throw new ConflictError('Email already exists in this shop');
    }
    if (err instanceof Error && err.message === 'Shop not found') {
        throw new UnauthorizedError('Shop not found');
    }
    throw err;
  }
};

export const getUserShopsService = async (email: string) => {
  const shops = await findUsersByEmail(email);
  return shops
    .filter((s) => s.is_active)
    .map((s) => ({
      shop_id: s.shop_id,
      shop_name: s.shop_name,
      shop_slug: s.shop_slug,
      role: s.role,
    }));
};

export const createShopForExistingUserService = async (
  _userId: string,
  _userEmail: string,
  _dto: CreateAdditionalShopDto,
  _sessionMeta?: SessionMeta
) => {
  throw new UnauthorizedError('Use /auth/register to create a new shop in this version');
};
