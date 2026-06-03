-- ============================================================
-- MÓDULO: Site Configs — Funciones y procedimientos almacenados
-- ============================================================

-- ─── LECTURA (Admin) ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_site_configs(
  p_shop_id   UUID,
  p_section   VARCHAR DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit     INTEGER DEFAULT 100,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id          UUID,
  shop_id     UUID,
  section     VARCHAR,
  key         VARCHAR,
  value       TEXT,
  value_type  VARCHAR,
  active      BOOLEAN,
  updated_by  UUID,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, section, key, value, value_type, active,
    updated_by, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM site_configs
  WHERE shop_id = p_shop_id
    AND (p_section   IS NULL OR section = p_section)
    AND (p_is_active IS NULL OR active  = p_is_active)
  ORDER BY section ASC, key ASC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_site_config(
  p_shop_id  UUID,
  p_config_id UUID
) RETURNS SETOF site_configs LANGUAGE sql STABLE AS $func$
  SELECT * FROM site_configs WHERE id = p_config_id AND shop_id = p_shop_id;
$func$;

-- ─── LECTURA (Público) ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_site_configs_publicas(
  p_shop_id UUID
) RETURNS TABLE (
  section     VARCHAR,
  key         VARCHAR,
  value       TEXT,
  value_type  VARCHAR
) LANGUAGE sql STABLE AS $func$
  SELECT
    section, key, value, value_type
  FROM site_configs
  WHERE shop_id = p_shop_id
    AND active = TRUE
  ORDER BY section ASC, key ASC;
$func$;

-- ─── ESCRITURA (Admin) ───────────────────────────────────────────────────────

-- sp_crear_site_config: valida que no exista duplicado (section,key) en la tienda
CREATE OR REPLACE FUNCTION sp_crear_site_config(
  p_shop_id     UUID,
  p_section     VARCHAR,
  p_key         VARCHAR,
  p_value       TEXT,
  p_value_type  VARCHAR DEFAULT 'text',
  p_active      BOOLEAN DEFAULT TRUE,
  p_updated_by  UUID    DEFAULT NULL
) RETURNS SETOF site_configs LANGUAGE plpgsql AS $func$
BEGIN
  IF EXISTS (
    SELECT 1 FROM site_configs
    WHERE shop_id = p_shop_id AND section = p_section AND key = p_key
  ) THEN
    RAISE EXCEPTION 'CONFIG_DUPLICADA:%:%', p_section, p_key USING ERRCODE = '23505';
  END IF;

  RETURN QUERY
  INSERT INTO site_configs (shop_id, section, key, value, value_type, active, updated_by)
  VALUES (p_shop_id, p_section, p_key, p_value, p_value_type, p_active, p_updated_by)
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_site_config(
  p_shop_id     UUID,
  p_config_id   UUID,
  p_value       TEXT    DEFAULT NULL,
  p_value_type  VARCHAR DEFAULT NULL,
  p_active      BOOLEAN DEFAULT NULL,
  p_updated_by  UUID    DEFAULT NULL
) RETURNS SETOF site_configs LANGUAGE plpgsql AS $func$
DECLARE
  v_actual site_configs%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM site_configs WHERE id = p_config_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CONFIG_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  UPDATE site_configs SET
    value      = COALESCE(p_value,      v_actual.value),
    value_type = COALESCE(p_value_type, v_actual.value_type),
    active     = COALESCE(p_active,     v_actual.active),
    updated_by = COALESCE(p_updated_by, v_actual.updated_by)
  WHERE id = p_config_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_eliminar_site_config(
  p_shop_id   UUID,
  p_config_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM site_configs WHERE id = p_config_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'CONFIG_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE site_configs SET active = FALSE WHERE id = p_config_id AND shop_id = p_shop_id;
END;
$func$;

-- ─── AUDITORÍA ────────────────────────────────────────────────────────────────

-- sp_registrar_auditoria: registro genérico de cambios del admin
CREATE OR REPLACE FUNCTION sp_registrar_auditoria(
  p_shop_id   UUID,
  p_action    VARCHAR,
  p_entity    VARCHAR,
  p_entity_id VARCHAR,
  p_old_value TEXT,
  p_new_value TEXT,
  p_user_id   UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  INSERT INTO audit_logs (shop_id, action, entity, entity_id, old_value, new_value, user_id)
  VALUES (p_shop_id, p_action, p_entity, p_entity_id, p_old_value, p_new_value, p_user_id);
END;
$func$;

COMMENT ON FUNCTION fn_listar_site_configs         IS 'Lista configs paginadas del tenant (admin).';
COMMENT ON FUNCTION fn_obtener_site_config         IS 'Obtiene una config por id (admin).';
COMMENT ON FUNCTION fn_listar_site_configs_publicas IS 'Lista configs activas del tenant (público).';
COMMENT ON FUNCTION sp_crear_site_config             IS 'Crea config validando duplicado section+key.';
COMMENT ON FUNCTION sp_actualizar_site_config        IS 'Actualiza config con COALESCE.';
COMMENT ON FUNCTION sp_eliminar_site_config          IS 'Soft delete de config.';
COMMENT ON FUNCTION sp_registrar_auditoria         IS 'Registro genérico de cambios en audit_logs.';
