import { query } from '../../config/database';
import { UpdateProfileDto, PreferenciasNotificacion } from './user.types';

export interface UsuarioConPassword {
  id: string;
  shop_id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  role: string;
  is_active: boolean;
  notification_preferences: unknown;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_pending_secret: string | null;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const obtenerUsuarioCompleto = async (
  shopId: string,
  userId: string
): Promise<UsuarioConPassword | null> => {
  const r = await query<UsuarioConPassword>(
    `SELECT id, shop_id, name, email, phone, password, role, is_active,
            notification_preferences, two_factor_enabled, two_factor_secret,
            two_factor_pending_secret, last_login, created_at, updated_at
     FROM users WHERE id = $1 AND shop_id = $2`,
    [userId, shopId]
  );
  return r.rows[0] ?? null;
};

export const emailUsuarioExisteEnTienda = async (
  shopId: string,
  email: string,
  excludeUserId: string
): Promise<boolean> => {
  const r = await query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM users
     WHERE shop_id = $1 AND lower(email::text) = $2 AND id != $3`,
    [shopId, email.toLowerCase(), excludeUserId]
  );
  return parseInt(r.rows[0]!.c, 10) > 0;
};

export const actualizarPerfilUsuario = async (
  shopId: string,
  userId: string,
  dto: UpdateProfileDto
): Promise<UsuarioConPassword | null> => {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (dto.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(dto.name);
  }
  if (dto.email !== undefined) {
    sets.push(`email = $${i++}`);
    vals.push(dto.email.toLowerCase());
  }
  if (dto.phone !== undefined) {
    sets.push(`phone = $${i++}`);
    vals.push(dto.phone);
  }
  vals.push(userId, shopId);
  const r = await query<UsuarioConPassword>(
    `UPDATE users SET ${sets.join(', ')}
     WHERE id = $${i++} AND shop_id = $${i}
     RETURNING id, shop_id, name, email, phone, password, role, is_active,
               notification_preferences, two_factor_enabled, two_factor_secret,
               two_factor_pending_secret, last_login, created_at, updated_at`,
    vals
  );
  return r.rows[0] ?? null;
};

export const actualizarPasswordUsuario = async (
  shopId: string,
  userId: string,
  passwordHash: string
): Promise<void> => {
  await query(`UPDATE users SET password = $3 WHERE id = $2 AND shop_id = $1`, [
    shopId,
    userId,
    passwordHash,
  ]);
};

export const guardarPreferenciasNotificacion = async (
  shopId: string,
  userId: string,
  prefs: PreferenciasNotificacion
): Promise<void> => {
  await query(`UPDATE users SET notification_preferences = $3::jsonb WHERE id = $2 AND shop_id = $1`, [
    shopId,
    userId,
    JSON.stringify(prefs),
  ]);
};

export const guardarPending2fa = async (
  shopId: string,
  userId: string,
  pendingSecret: string | null
): Promise<void> => {
  await query(
    `UPDATE users SET two_factor_pending_secret = $3 WHERE id = $2 AND shop_id = $1`,
    [shopId, userId, pendingSecret]
  );
};

export const activar2faUsuario = async (
  shopId: string,
  userId: string,
  secret: string
): Promise<void> => {
  await query(
    `UPDATE users SET
       two_factor_secret = $3,
       two_factor_pending_secret = NULL,
       two_factor_enabled = TRUE
     WHERE id = $2 AND shop_id = $1`,
    [shopId, userId, secret]
  );
};

export const desactivar2faUsuario = async (shopId: string, userId: string): Promise<void> => {
  await query(
    `UPDATE users SET
       two_factor_enabled = FALSE,
       two_factor_secret = NULL,
       two_factor_pending_secret = NULL
     WHERE id = $2 AND shop_id = $1`,
    [shopId, userId]
  );
};
