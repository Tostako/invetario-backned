-- ============================================================
-- MÓDULO: Customer Configs — Funciones y procedimientos almacenados
-- ============================================================

-- ─── LECTURA (Admin) ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_customer_configs(
  p_shop_id   UUID,
  p_limit     INTEGER DEFAULT 50,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id               UUID,
  shop_id          UUID,
  customer_id      UUID,
  services         JSONB,
  sub_packages     JSONB,
  complete_package JSONB,
  payment_plan     JSONB,
  invoice          JSONB,
  estimation       JSONB,
  created_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ,
  total_count      BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, customer_id, services, sub_packages, complete_package,
    payment_plan, invoice, estimation, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM customer_configs
  WHERE shop_id = p_shop_id
  ORDER BY updated_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

-- ─── LECTURA (Admin o Customer) ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_obtener_customer_config(
  p_shop_id     UUID,
  p_config_id   UUID
) RETURNS SETOF customer_configs LANGUAGE sql STABLE AS $func$
  SELECT * FROM customer_configs WHERE id = p_config_id AND shop_id = p_shop_id;
$func$;

-- ─── LECTURA (Customer: solo la suya) ────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_obtener_customer_config_propia(
  p_shop_id     UUID,
  p_customer_id UUID
) RETURNS SETOF customer_configs LANGUAGE sql STABLE AS $func$
  SELECT * FROM customer_configs WHERE shop_id = p_shop_id AND customer_id = p_customer_id;
$func$;

-- ─── ESCRITURA (Customer: crear o actualizar la suya) ────────────────────────

CREATE OR REPLACE FUNCTION sp_upsert_customer_config(
  p_shop_id          UUID,
  p_customer_id      UUID,
  p_services         JSONB DEFAULT NULL,
  p_sub_packages     JSONB DEFAULT NULL,
  p_complete_package JSONB DEFAULT NULL,
  p_payment_plan     JSONB DEFAULT NULL,
  p_invoice          JSONB DEFAULT NULL,
  p_estimation       JSONB DEFAULT NULL
) RETURNS SETOF customer_configs LANGUAGE plpgsql AS $func$
DECLARE
  v_existente customer_configs%ROWTYPE;
BEGIN
  SELECT * INTO v_existente FROM customer_configs
  WHERE shop_id = p_shop_id AND customer_id = p_customer_id;

  IF FOUND THEN
    -- Actualizar (COALESCE preserva campos no enviados)
    RETURN QUERY
    UPDATE customer_configs SET
      services         = COALESCE(p_services,         v_existente.services),
      sub_packages     = COALESCE(p_sub_packages,     v_existente.sub_packages),
      complete_package = COALESCE(p_complete_package, v_existente.complete_package),
      payment_plan     = COALESCE(p_payment_plan,     v_existente.payment_plan),
      invoice          = COALESCE(p_invoice,          v_existente.invoice),
      estimation       = COALESCE(p_estimation,       v_existente.estimation)
    WHERE id = v_existente.id
    RETURNING *;
  ELSE
    -- Crear nueva
    RETURN QUERY
    INSERT INTO customer_configs
      (shop_id, customer_id, services, sub_packages, complete_package, payment_plan, invoice, estimation)
    VALUES
      (p_shop_id, p_customer_id,
       COALESCE(p_services, '{}'),
       COALESCE(p_sub_packages, '{}'),
       COALESCE(p_complete_package, '{}'),
       COALESCE(p_payment_plan, '{}'),
       COALESCE(p_invoice, '{}'),
       COALESCE(p_estimation, '{}'))
    RETURNING *;
  END IF;
END;
$func$;

-- ─── ESCRITURA (Admin: eliminar config de un customer) ───────────────────────

CREATE OR REPLACE FUNCTION sp_eliminar_customer_config(
  p_shop_id   UUID,
  p_config_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM customer_configs WHERE id = p_config_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'CUSTOMER_CONFIG_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM customer_configs WHERE id = p_config_id AND shop_id = p_shop_id;
END;
$func$;

COMMENT ON FUNCTION fn_listar_customer_configs         IS 'Lista configs de customers del tenant (admin).';
COMMENT ON FUNCTION fn_obtener_customer_config          IS 'Obtiene una config por id (admin).';
COMMENT ON FUNCTION fn_obtener_customer_config_propia   IS 'Obtiene la config del customer autenticado.';
COMMENT ON FUNCTION sp_upsert_customer_config             IS 'Crea o actualiza la config del customer (upsert).';
COMMENT ON FUNCTION sp_eliminar_customer_config          IS 'Elimina config de un customer (admin).';
