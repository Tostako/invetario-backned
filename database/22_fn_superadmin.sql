-- ============================================================
-- MÓDULO: SuperAdmin — Funciones y procedimientos globales
-- Los super_admins no pertenecen a ningún tenant.
-- Tienen acceso de lectura/escritura a TODAS las tiendas.
-- ============================================================

-- ─── Auth de superadmin ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_buscar_superadmin_login(
  p_email CITEXT
) RETURNS TABLE (
  id        UUID,
  email     CITEXT,
  password  TEXT,
  name      VARCHAR,
  is_active BOOLEAN
) LANGUAGE sql STABLE AS $func$
  SELECT id, email, password, name, is_active
  FROM super_admins WHERE email = p_email;
$func$;

CREATE OR REPLACE FUNCTION sp_crear_superadmin(
  p_email          CITEXT,
  p_password_hash  TEXT,
  p_name           VARCHAR
) RETURNS TABLE (id UUID) LANGUAGE sql AS $func$
  INSERT INTO super_admins (email, password, name)
  VALUES (p_email, p_password_hash, p_name)
  RETURNING id;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_ultimo_login_superadmin(
  p_id UUID
) RETURNS VOID LANGUAGE sql AS $func$
  UPDATE super_admins SET last_login = NOW() WHERE id = p_id;
$func$;

CREATE OR REPLACE FUNCTION fn_contar_superadmins()
RETURNS BIGINT LANGUAGE sql STABLE AS $func$
  SELECT COUNT(*) FROM super_admins;
$func$;

-- ─── CRUD de Tiendas (vista global) ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_tiendas_admin(
  p_limit  INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id         UUID,
  name       VARCHAR,
  slug       CITEXT,
  email      CITEXT,
  phone      VARCHAR,
  address    TEXT,
  logo_url   TEXT,
  currency   CHAR,
  timezone   VARCHAR,
  is_active  BOOLEAN,
  plan       VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total      BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, name, slug, email, phone, address, logo_url,
    currency, timezone, is_active, plan, created_at, updated_at,
    COUNT(*) OVER() AS total
  FROM shops
  ORDER BY created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_tienda_admin(
  p_shop_id UUID
) RETURNS SETOF shops LANGUAGE sql STABLE AS $func$
  SELECT * FROM shops WHERE id = p_shop_id;
$func$;

-- sp_crear_tienda_admin: crea tienda + owner (igual que sp_registrar_tienda pero
-- con todos los campos opcionales de la tienda)
CREATE OR REPLACE FUNCTION sp_crear_tienda_admin(
  p_name           VARCHAR,
  p_slug           CITEXT,
  p_email          CITEXT,
  p_owner_name     VARCHAR,
  p_owner_email    CITEXT,
  p_owner_password TEXT,
  p_phone          VARCHAR DEFAULT NULL,
  p_address        TEXT    DEFAULT NULL,
  p_logo_url       TEXT    DEFAULT NULL,
  p_currency       CHAR(3) DEFAULT 'USD',
  p_timezone       VARCHAR DEFAULT 'UTC',
  p_plan           VARCHAR DEFAULT 'free'
) RETURNS TABLE (shop_id UUID, owner_id UUID) LANGUAGE plpgsql AS $func$
DECLARE
  v_shop_id  UUID;
  v_owner_id UUID;
BEGIN
  INSERT INTO shops (name, slug, email, phone, address, logo_url, currency, timezone, plan)
  VALUES (p_name, p_slug, p_email, p_phone, p_address, p_logo_url, p_currency, p_timezone, p_plan)
  RETURNING id INTO v_shop_id;

  INSERT INTO users (shop_id, email, password, name, role)
  VALUES (v_shop_id, p_owner_email, p_owner_password, p_owner_name, 'owner')
  RETURNING id INTO v_owner_id;

  RETURN QUERY SELECT v_shop_id, v_owner_id;
END;
$func$;

-- sp_actualizar_tienda: actualiza campos de tienda con COALESCE
CREATE OR REPLACE FUNCTION sp_actualizar_tienda(
  p_shop_id   UUID,
  p_name      VARCHAR  DEFAULT NULL,
  p_email     CITEXT   DEFAULT NULL,
  p_phone     VARCHAR  DEFAULT NULL,
  p_address   TEXT     DEFAULT NULL,
  p_logo_url  TEXT     DEFAULT NULL,
  p_currency  CHAR(3)  DEFAULT NULL,
  p_timezone  VARCHAR  DEFAULT NULL,
  p_is_active BOOLEAN  DEFAULT NULL,
  p_plan      VARCHAR  DEFAULT NULL
) RETURNS SETOF shops LANGUAGE plpgsql AS $func$
DECLARE
  v_actual shops%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM shops WHERE id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SHOP_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  UPDATE shops SET
    name      = COALESCE(p_name,      v_actual.name),
    email     = COALESCE(p_email,     v_actual.email),
    phone     = COALESCE(p_phone,     v_actual.phone),
    address   = COALESCE(p_address,   v_actual.address),
    logo_url  = COALESCE(p_logo_url,  v_actual.logo_url),
    currency  = COALESCE(p_currency,  v_actual.currency),
    timezone  = COALESCE(p_timezone,  v_actual.timezone),
    is_active = COALESCE(p_is_active, v_actual.is_active),
    plan      = COALESCE(p_plan,      v_actual.plan)
  WHERE id = p_shop_id
  RETURNING *;
END;
$func$;

-- sp_desactivar_tienda: soft delete de tienda
CREATE OR REPLACE FUNCTION sp_desactivar_tienda(
  p_shop_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shops WHERE id = p_shop_id) THEN
    RAISE EXCEPTION 'SHOP_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE shops SET is_active = FALSE WHERE id = p_shop_id;
END;
$func$;

COMMENT ON FUNCTION fn_buscar_superadmin_login    IS 'Lookup de superadmin para autenticación global (sin tenant).';
COMMENT ON FUNCTION sp_crear_superadmin           IS 'Crea superadmin con password ya hasheado por Node.js.';
COMMENT ON FUNCTION fn_listar_tiendas_admin       IS 'Lista todas las tiendas paginadas (solo superadmin).';
COMMENT ON FUNCTION sp_crear_tienda_admin         IS 'Crea tienda + owner desde panel de superadmin.';
COMMENT ON FUNCTION sp_actualizar_tienda          IS 'Actualiza campos de tienda con COALESCE.';
COMMENT ON FUNCTION sp_desactivar_tienda          IS 'Soft delete de tienda. No borra datos.';
