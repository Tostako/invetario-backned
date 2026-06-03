-- ============================================================
-- MÓDULO: Quotes — Funciones y procedimientos almacenados
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_cotizaciones(
  p_shop_id     UUID,
  p_customer_id UUID    DEFAULT NULL,   -- NULL = admin ve todas de la tienda
  p_status      VARCHAR DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
) RETURNS TABLE (
  id          UUID,
  shop_id     UUID,
  customer_id UUID,
  client      VARCHAR,
  project     VARCHAR,
  area        NUMERIC,
  price       NUMERIC,
  status      VARCHAR,
  data        JSONB,
  date        DATE,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, customer_id, client, project, area, price, status,
    data, date, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM quotes
  WHERE shop_id = p_shop_id
    AND (p_customer_id IS NULL OR customer_id = p_customer_id)
    AND (p_status      IS NULL OR status     = p_status)
  ORDER BY created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_cotizacion(
  p_shop_id  UUID,
  p_quote_id UUID
) RETURNS SETOF quotes LANGUAGE sql STABLE AS $func$
  SELECT * FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id;
$func$;

-- ─── ESCRITURA ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sp_crear_cotizacion(
  p_shop_id     UUID,
  p_customer_id UUID,
  p_client      VARCHAR,
  p_project     VARCHAR,
  p_area        NUMERIC,
  p_price       NUMERIC,
  p_status      VARCHAR DEFAULT 'draft',
  p_data        JSONB   DEFAULT '{}',
  p_date        DATE    DEFAULT CURRENT_DATE
) RETURNS SETOF quotes LANGUAGE plpgsql AS $func$
BEGIN
  RETURN QUERY
  INSERT INTO quotes (shop_id, customer_id, client, project, area, price, status, data, date)
  VALUES (p_shop_id, p_customer_id, p_client, p_project, p_area, p_price, p_status, p_data, p_date)
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_cotizacion(
  p_shop_id     UUID,
  p_quote_id    UUID,
  p_customer_id UUID    DEFAULT NULL,
  p_client      VARCHAR DEFAULT NULL,
  p_project     VARCHAR DEFAULT NULL,
  p_area        NUMERIC DEFAULT NULL,
  p_price       NUMERIC DEFAULT NULL,
  p_status      VARCHAR DEFAULT NULL,
  p_data        JSONB   DEFAULT NULL,
  p_date        DATE    DEFAULT NULL
) RETURNS SETOF quotes LANGUAGE plpgsql AS $func$
DECLARE
  v_actual quotes%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Solo el dueño de la cotización puede actualizar (verificado en capa app)

  RETURN QUERY
  UPDATE quotes SET
    client      = COALESCE(p_client,      v_actual.client),
    project     = COALESCE(p_project,     v_actual.project),
    area        = COALESCE(p_area,        v_actual.area),
    price       = COALESCE(p_price,       v_actual.price),
    status      = COALESCE(p_status,      v_actual.status),
    data        = COALESCE(p_data,        v_actual.data),
    date        = COALESCE(p_date,        v_actual.date)
  WHERE id = p_quote_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_eliminar_cotizacion(
  p_shop_id  UUID,
  p_quote_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id;
END;
$func$;

COMMENT ON FUNCTION fn_listar_cotizaciones  IS 'Lista cotizaciones del tenant. Admin ve todas, customer solo las suyas.';
COMMENT ON FUNCTION fn_obtener_cotizacion     IS 'Obtiene una cotización por id.';
COMMENT ON FUNCTION sp_crear_cotizacion        IS 'Crea cotización.';
COMMENT ON FUNCTION sp_actualizar_cotizacion   IS 'Actualiza cotización con COALESCE.';
COMMENT ON FUNCTION sp_eliminar_cotizacion   IS 'Elimina cotización físicamente (hard delete). El customer es dueño.';
