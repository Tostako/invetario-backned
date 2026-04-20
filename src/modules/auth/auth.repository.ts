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
