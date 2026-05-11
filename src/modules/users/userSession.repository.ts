import { query } from '../../config/database';

export interface CrearSesionParams {
  userId: string;
  shopId: string;
  jti: string;
  userAgent: string | null;
  ipAddress: string | null;
}

export const crearSesionUsuario = async (p: CrearSesionParams): Promise<void> => {
  await query(
    `INSERT INTO user_sessions (user_id, shop_id, jti, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [p.userId, p.shopId, p.jti, p.userAgent, p.ipAddress]
  );
};

export const sesionActivaPorJti = async (
  userId: string,
  shopId: string,
  jti: string
): Promise<boolean> => {
  const r = await query<{ ok: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM user_sessions
       WHERE user_id = $1 AND shop_id = $2 AND jti = $3 AND revoked_at IS NULL
     ) AS ok`,
    [userId, shopId, jti]
  );
  return r.rows[0]?.ok === true;
};

export const listarSesionesUsuario = async (userId: string, shopId: string) => {
  return query<{
    id: string;
    created_at: Date;
    last_seen_at: Date;
    user_agent: string | null;
    ip_address: string | null;
    revoked_at: Date | null;
    jti: string;
  }>(
    `SELECT id, created_at, last_seen_at, user_agent, ip_address, revoked_at, jti
     FROM user_sessions
     WHERE user_id = $1 AND shop_id = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId, shopId]
  );
};

export const revocarSesion = async (
  userId: string,
  shopId: string,
  sessionId: string
): Promise<boolean> => {
  const r = await query(
    `UPDATE user_sessions
     SET revoked_at = NOW()
     WHERE id = $1 AND user_id = $2 AND shop_id = $3 AND revoked_at IS NULL`,
    [sessionId, userId, shopId]
  );
  return (r.rowCount ?? 0) > 0;
};
