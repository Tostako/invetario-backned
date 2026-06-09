// ─── Auth Repository ─────────────────────────────────────────────────────────
// Thin adapter: solo invoca funciones/procedimientos de la BD.
// Sin SQL ad-hoc — toda la lógica de persistencia vive en:
//   database/16_fn_auth.sql
//
// El hashing bcrypt ocurre en Node.js (bcrypt no es nativo en PostgreSQL).
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { RegisterShopDto, RegisterCustomerDto } from './auth.types';
import bcrypt from 'bcryptjs';

// ─── Usuarios (staff/owner) ───────────────────────────────────────────────────

export const findUserByEmailAndShop = async (email: string, shopSlug: string) => {
  const result = await query<{
    id: string; shop_id: string; email: string;
    password: string; name: string; role: string; is_active: boolean;
  }>(
    `SELECT * FROM fn_buscar_usuario_login($1, $2)`,
    [email.toLowerCase(), shopSlug]
  );
  return result.rows[0] ?? null;
};

export const findUsersByEmail = async (email: string) => {
  const result = await query<{
    user_id: string;
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    user_name: string;
    role: string;
    password: string;
    is_active: boolean;
  }>(
    `SELECT * FROM fn_buscar_usuarios_por_email($1)`,
    [email.toLowerCase()]
  );
  return result.rows;
};

export const findUserByIdAndShop = async (userId: string, shopId: string) => {
  const result = await query<{
    id: string; shop_id: string; email: string;
    name: string; role: string; is_active: boolean;
  }>(
    `SELECT id, shop_id, email, name, role, is_active FROM users WHERE id = $1 AND shop_id = $2`,
    [userId, shopId]
  );
  return result.rows[0] ?? null;
};

export const createShopWithOwner = async (dto: RegisterShopDto) => {
  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const result = await query<{ shop_id: string; user_id: string }>(
    `SELECT * FROM sp_registrar_tienda($1, $2, $3, $4, $5, $6)`,
    [
      dto.shop_name,
      dto.shop_slug,
      dto.shop_email.toLowerCase(),
      dto.owner_name,
      dto.owner_email.toLowerCase(),
      hashedPassword,
    ]
  );
  const row = result.rows[0]!;
  return { shopId: row.shop_id, userId: row.user_id };
};

export const updateLastLogin = (userId: string): Promise<void> =>
  query(`SELECT sp_actualizar_ultimo_login_usuario($1)`, [userId]).then(() => undefined);

// ─── Customers ────────────────────────────────────────────────────────────────

export const findCustomerByEmailAndShop = async (email: string, shopSlug: string) => {
  const result = await query<{
    id: string; shop_id: string; email: string;
    password: string; name: string; is_active: boolean;
  }>(
    `SELECT * FROM fn_buscar_customer_login($1, $2)`,
    [email.toLowerCase(), shopSlug]
  );
  return result.rows[0] ?? null;
};

export const createCustomer = async (dto: RegisterCustomerDto) => {
  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const result = await query<{ shop_id: string; customer_id: string }>(
    `SELECT * FROM sp_registrar_customer($1, $2, $3, $4, $5, $6)`,
    [
      dto.shop_slug,
      dto.name,
      dto.email.toLowerCase(),
      hashedPassword,
      dto.phone ?? null,
      dto.address ?? null,
    ]
  );
  const row = result.rows[0]!;
  return { shopId: row.shop_id, customerId: row.customer_id };
};

export const updateCustomerLastLogin = (customerId: string): Promise<void> =>
  query(`SELECT sp_actualizar_ultimo_login_customer($1)`, [customerId]).then(() => undefined);

/** Busca el customer vinculado por email dentro de una tienda (sin slug). */
export const findCustomerIdByEmailAndShop = async (
  email: string,
  shopId: string
): Promise<string | null> => {
  const result = await query<{ id: string }>(
    `SELECT id FROM customers WHERE shop_id = $1 AND email = $2 LIMIT 1`,
    [shopId, email.toLowerCase()]
  );
  return result.rows[0]?.id ?? null;
};

/** Garantiza un registro en customers para un usuario de tienda (owner/admin/staff). */
export const ensureCustomerForShopUser = async (
  shopId: string,
  email: string,
  name: string
): Promise<string> => {
  const normalizedEmail = email.toLowerCase();
  const existing = await findCustomerIdByEmailAndShop(normalizedEmail, shopId);
  if (existing) return existing;

  const result = await query<{ id: string }>(
    `INSERT INTO customers (shop_id, name, email) VALUES ($1, $2, $3) RETURNING id`,
    [shopId, name, normalizedEmail]
  );
  return result.rows[0]!.id;
};
export const createShopForExistingUser = async (userId: string, dto: { shop_name: string; shop_slug: string; shop_email: string }) => {
  const result = await query<{ shop_id: string; user_id: string }>(
    `SELECT * FROM sp_crear_tienda_para_user_existente($1, $2, $3, $4)`,
    [
      dto.shop_name,
      dto.shop_slug,
      dto.shop_email.toLowerCase(),
      userId,
    ]
  );
  const row = result.rows[0]!;
  return { shopId: row.shop_id, userId: row.user_id };
};
