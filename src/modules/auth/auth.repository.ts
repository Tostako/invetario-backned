import { query, withTransaction } from '../../config/database';
import { RegisterShopDto } from './auth.types';
import bcrypt from 'bcryptjs';

// Busca un usuario por email dentro de un shop específico (multitenancy)
export const findUserByEmailAndShop = async (email: string, shopSlug: string) => {
  const result = await query<{
    id: string; shop_id: string; email: string;
    password: string; name: string; role: string; is_active: boolean;
  }>(
    `SELECT u.id, u.shop_id, u.email, u.password, u.name, u.role, u.is_active
     FROM users u
     JOIN shops s ON s.id = u.shop_id
     WHERE u.email = $1
       AND s.slug  = $2
       AND s.is_active = TRUE`,
    [email.toLowerCase(), shopSlug]
  );
  return result.rows[0] ?? null;
};

// Registra una tienda nueva con su owner en una transacción atómica
export const createShopWithOwner = async (dto: RegisterShopDto) => {
  return withTransaction(async (client) => {
    // 1. Crear la tienda (tenant)
    const shopResult = await client.query<{ id: string }>(
      `INSERT INTO shops (name, slug, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [dto.shop_name, dto.shop_slug, dto.shop_email.toLowerCase()]
    );
    const shop = shopResult.rows[0]!;

    // 2. Crear el owner con password hasheado
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const userResult = await client.query<{ id: string }>(
      `INSERT INTO users (shop_id, email, password, name, role)
       VALUES ($1, $2, $3, $4, 'owner')
       RETURNING id`,
      [shop.id, dto.owner_email.toLowerCase(), hashedPassword, dto.owner_name]
    );

    return { shopId: shop.id, userId: userResult.rows[0]!.id };
  });
};

// Registra el último acceso del usuario
export const updateLastLogin = (userId: string): Promise<void> =>
  query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]).then(() => undefined);
