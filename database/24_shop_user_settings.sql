-- ============================================================
-- Configuración de tienda, usuario, sesiones y 2FA
-- Ejecutar después de las migraciones anteriores.
-- ============================================================

-- ─── Tienda: descripción, IVA, mínimo de pedido ─────────────────────────────
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,2) NOT NULL DEFAULT 0
  CHECK (vat_rate >= 0 AND vat_rate <= 100);

ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0
  CHECK (min_order_amount >= 0);

COMMENT ON COLUMN shops.description       IS 'Texto libre para el panel público o interno.';
COMMENT ON COLUMN shops.vat_rate          IS 'Porcentaje de IVA aplicable (0–100).';
COMMENT ON COLUMN shops.min_order_amount  IS 'Importe mínimo del pedido en la moneda de la tienda.';

-- ─── Usuario empleado: teléfono, preferencias, 2FA ───────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(64);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS two_factor_pending_secret VARCHAR(64);

COMMENT ON COLUMN users.notification_preferences   IS 'Preferencias de notificación (JSON).';
COMMENT ON COLUMN users.two_factor_secret          IS 'Secreto TOTP en base32 (activo).';
COMMENT ON COLUMN users.two_factor_pending_secret IS 'Secreto TOTP pendiente de confirmación.';

-- ─── Sesiones (revocación por jti en JWT) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_id      UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  jti          VARCHAR(64) NOT NULL UNIQUE,
  user_agent   TEXT,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_shop
  ON user_sessions(user_id, shop_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_jti_active
  ON user_sessions(jti) WHERE revoked_at IS NULL;

COMMENT ON TABLE user_sessions IS 'Sesiones de usuarios de tienda; revocar invalida el JWT con ese jti.';

-- ─── Login multi-tienda: incluir nombre del usuario en el resultado ─────────
-- No se puede cambiar el RETURNS TABLE con CREATE OR REPLACE: hay que eliminar primero.
DROP FUNCTION IF EXISTS fn_buscar_usuarios_por_email(CITEXT);

CREATE OR REPLACE FUNCTION fn_buscar_usuarios_por_email(
  p_email CITEXT
) RETURNS TABLE (
  user_id   UUID,
  shop_id   UUID,
  shop_name VARCHAR,
  shop_slug CITEXT,
  user_name VARCHAR,
  role      VARCHAR,
  password  VARCHAR,
  is_active BOOLEAN
) LANGUAGE sql STABLE AS $func$
  SELECT u.id, u.shop_id, s.name, s.slug, u.name, u.role, u.password, u.is_active
  FROM   users u
  JOIN   shops s ON s.id = u.shop_id
  WHERE  u.email = p_email
    AND  s.is_active = TRUE;
$func$;

COMMENT ON FUNCTION fn_buscar_usuarios_por_email IS 'Usuarios por email con nombre de usuario y tienda (multitenant).';
