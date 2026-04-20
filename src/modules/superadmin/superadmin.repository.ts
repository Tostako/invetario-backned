// ─── SuperAdmin Repository ────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/22_fn_superadmin.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import bcrypt from 'bcryptjs';
import { RegisterSuperAdminDto, CreateShopDto, UpdateShopDto } from './superadmin.types';

// ─── Super Admins ─────────────────────────────────────────────────────────────

export const findSuperAdminByEmail = async (email: string) => {
  const result = await query<{
    id: string; email: string; password: string;
    name: string; is_active: boolean;
  }>(
    `SELECT * FROM fn_buscar_superadmin_login($1)`,
    [email.toLowerCase()]
  );
  return result.rows[0] ?? null;
};

export const createSuperAdmin = async (dto: RegisterSuperAdminDto) => {
  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const result = await query<{ id: string }>(
    `SELECT * FROM sp_crear_superadmin($1, $2, $3)`,
    [dto.email.toLowerCase(), hashedPassword, dto.name]
  );
  return result.rows[0]!;
};

export const updateSuperAdminLastLogin = (id: string): Promise<void> =>
  query(`SELECT sp_actualizar_ultimo_login_superadmin($1)`, [id]).then(() => undefined);

export const countSuperAdmins = async (): Promise<number> => {
  const result = await query<{ fn_contar_superadmins: string }>(
    `SELECT fn_contar_superadmins()`
  );
  return parseInt(result.rows[0]!.fn_contar_superadmins, 10);
};

// ─── Tiendas (CRUD global) ────────────────────────────────────────────────────

export const listarTiendas = async (limit: number, offset: number) => {
  const result = await query<{
    id: string; name: string; slug: string; email: string;
    phone: string | null; address: string | null; logo_url: string | null;
    currency: string; timezone: string; is_active: boolean;
    plan: string; created_at: Date; updated_at: Date;
    total: string;
  }>(
    `SELECT * FROM fn_listar_tiendas_admin($1, $2)`,
    [limit, offset]
  );
  return result.rows;
};

export const findTiendaById = async (id: string) => {
  const result = await query<{
    id: string; name: string; slug: string; email: string;
    phone: string | null; address: string | null; logo_url: string | null;
    currency: string; timezone: string; is_active: boolean;
    plan: string; created_at: Date; updated_at: Date;
  }>(
    `SELECT * FROM fn_obtener_tienda_admin($1)`,
    [id]
  );
  return result.rows[0] ?? null;
};

export const crearTienda = async (dto: CreateShopDto) => {
  const hashedPassword = await bcrypt.hash(dto.owner_password, 12);
  const result = await query<{ shop_id: string; owner_id: string }>(
    `SELECT * FROM sp_crear_tienda_admin($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      dto.name,
      dto.slug,
      dto.email.toLowerCase(),
      dto.owner_name,
      dto.owner_email.toLowerCase(),
      hashedPassword,
      dto.phone     ?? null,
      dto.address   ?? null,
      dto.logo_url  ?? null,
      dto.currency,
      dto.timezone,
      dto.plan,
    ]
  );
  return result.rows[0]!;
};

export const actualizarTienda = async (id: string, dto: UpdateShopDto) => {
  const result = await query<{ id: string }>(
    `SELECT id FROM sp_actualizar_tienda($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      dto.name      ?? null,
      dto.email     ?? null,
      dto.phone     ?? null,
      dto.address   ?? null,
      dto.logo_url  ?? null,
      dto.currency  ?? null,
      dto.timezone  ?? null,
      dto.is_active ?? null,
      dto.plan      ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const eliminarTienda = async (id: string) => {
  await query(`SELECT sp_desactivar_tienda($1)`, [id]);
};
