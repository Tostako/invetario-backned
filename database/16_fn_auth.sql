-- ============================================================
-- MÓDULO: Auth — Funciones de base de datos
-- Arquitectura Database-Centric: toda la lógica de persistencia
-- y validación de integridad vive aquí.
-- NOTA: El hashing de passwords (bcrypt) permanece en Node.js
--       ya que pgcrypto no soporta bcrypt nativo.
-- ============================================================

-- ─── Buscar usuario para login (con join al tenant) ──────────────────────────

CREATE OR REPLACE FUNCTION fn_buscar_usuario_login(
  p_email     CITEXT,
  p_shop_slug CITEXT
) RETURNS TABLE (
  id        UUID,
  shop_id   UUID,
  email     CITEXT,
  password  VARCHAR,
  name      VARCHAR,
  role      VARCHAR,
  is_active BOOLEAN
) LANGUAGE sql STABLE AS $func$
  SELECT u.id, u.shop_id, u.email, u.password, u.name, u.role, u.is_active
  FROM   users u
  JOIN   shops s ON s.id = u.shop_id
  WHERE  u.email    = p_email
    AND  s.slug     = p_shop_slug
    AND  s.is_active = TRUE;
$func$;

-- ─── Registrar tienda + owner (transacción atómica) ──────────────────────────

CREATE OR REPLACE FUNCTION sp_registrar_tienda(
  p_shop_name      VARCHAR,
  p_shop_slug      CITEXT,
  p_shop_email     CITEXT,
  p_owner_name     VARCHAR,
  p_owner_email    CITEXT,
  p_owner_password TEXT       -- hash bcrypt generado por Node.js
) RETURNS TABLE (shop_id UUID, user_id UUID) LANGUAGE plpgsql AS $func$
DECLARE
  v_shop_id UUID;
  v_user_id UUID;
BEGIN
  INSERT INTO shops (name, slug, email)
  VALUES (p_shop_name, p_shop_slug, p_shop_email)
  RETURNING id INTO v_shop_id;

  INSERT INTO users (shop_id, email, password, name, role)
  VALUES (v_shop_id, p_owner_email, p_owner_password, p_owner_name, 'owner')
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT v_shop_id, v_user_id;
END;
$func$;

-- ─── Actualizar último acceso de usuario ─────────────────────────────────────

CREATE OR REPLACE FUNCTION sp_actualizar_ultimo_login_usuario(
  p_user_id UUID
) RETURNS VOID LANGUAGE sql AS $func$
  UPDATE users SET last_login = NOW() WHERE id = p_user_id;
$func$;

-- ─── Buscar customer para login ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_buscar_customer_login(
  p_email     CITEXT,
  p_shop_slug CITEXT
) RETURNS TABLE (
  id        UUID,
  shop_id   UUID,
  email     CITEXT,
  password  TEXT,
  name      VARCHAR,
  is_active BOOLEAN
) LANGUAGE sql STABLE AS $func$
  SELECT c.id, c.shop_id, c.email, c.password, c.name, c.is_active
  FROM   customers c
  JOIN   shops     s ON s.id = c.shop_id
  WHERE  c.email    = p_email
    AND  s.slug     = p_shop_slug
    AND  s.is_active = TRUE;
$func$;

-- ─── Registrar customer (transacción atómica) ─────────────────────────────────

CREATE OR REPLACE FUNCTION sp_registrar_customer(
  p_shop_slug       CITEXT,
  p_name            VARCHAR,
  p_email           CITEXT,
  p_password_hash   TEXT,
  p_phone           VARCHAR DEFAULT NULL,
  p_address         TEXT    DEFAULT NULL
) RETURNS TABLE (shop_id UUID, customer_id UUID) LANGUAGE plpgsql AS $func$
DECLARE
  v_shop_id     UUID;
  v_customer_id UUID;
BEGIN
  SELECT id INTO v_shop_id FROM shops WHERE slug = p_shop_slug AND is_active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SHOP_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO customers (shop_id, name, email, password, phone, address)
  VALUES (v_shop_id, p_name, p_email, p_password_hash, p_phone, p_address)
  RETURNING id INTO v_customer_id;

  RETURN QUERY SELECT v_shop_id, v_customer_id;
END;
$func$;

-- ─── Actualizar último acceso de customer ─────────────────────────────────────

CREATE OR REPLACE FUNCTION sp_actualizar_ultimo_login_customer(
  p_customer_id UUID
) RETURNS VOID LANGUAGE sql AS $func$
  UPDATE customers SET last_login = NOW() WHERE id = p_customer_id;
$func$;

COMMENT ON FUNCTION fn_buscar_usuario_login    IS 'Lookup de usuario para autenticación. Filtra por tenant vía shop_slug.';
COMMENT ON FUNCTION sp_registrar_tienda        IS 'Crea tienda + owner en una transacción atómica. Recibe password ya hasheado.';
COMMENT ON FUNCTION fn_buscar_customer_login   IS 'Lookup de customer para autenticación. Filtra por tenant vía shop_slug.';
COMMENT ON FUNCTION sp_registrar_customer      IS 'Crea customer en el tenant identificado por slug. Recibe password ya hasheado.';
