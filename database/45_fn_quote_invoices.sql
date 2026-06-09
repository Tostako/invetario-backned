-- ============================================================
-- MÓDULO: Quote Invoices — Funciones y procedimientos
-- ============================================================

CREATE OR REPLACE FUNCTION fn_listar_cuentas_cobro_cotizacion(
  p_shop_id   UUID,
  p_quote_id  UUID,
  p_status    VARCHAR DEFAULT NULL,
  p_sort_dir  VARCHAR DEFAULT 'desc'
) RETURNS TABLE (
  id           UUID,
  shop_id      UUID,
  quote_id     UUID,
  number       INTEGER,
  client       VARCHAR,
  project      VARCHAR,
  description  TEXT,
  total_amount NUMERIC,
  status       VARCHAR,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ,
  total_count  BIGINT
) LANGUAGE plpgsql STABLE AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  SELECT
    qi.id, qi.shop_id, qi.quote_id, qi.number, qi.client, qi.project,
    qi.description, qi.total_amount, qi.status, qi.paid_at,
    qi.created_at, qi.updated_at,
    COUNT(*) OVER() AS total_count
  FROM quote_invoices qi
  WHERE qi.shop_id = p_shop_id
    AND qi.quote_id = p_quote_id
    AND qi.deleted_at IS NULL
    AND (p_status IS NULL OR qi.status = p_status)
  ORDER BY
    CASE WHEN lower(p_sort_dir) = 'asc'  THEN qi.created_at END ASC,
    CASE WHEN lower(p_sort_dir) != 'asc' THEN qi.created_at END DESC;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_cuenta_cobro(
  p_shop_id    UUID,
  p_quote_id   UUID,
  p_invoice_id UUID
) RETURNS SETOF quote_invoices LANGUAGE plpgsql STABLE AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  SELECT *
  FROM quote_invoices
  WHERE id = p_invoice_id
    AND shop_id = p_shop_id
    AND quote_id = p_quote_id
    AND deleted_at IS NULL;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_crear_cuenta_cobro(
  p_shop_id            UUID,
  p_quote_id           UUID,
  p_number             INTEGER,
  p_client             VARCHAR,
  p_project            VARCHAR,
  p_description        TEXT,
  p_total_amount       NUMERIC,
  p_form_data_snapshot JSONB,
  p_created_at         TIMESTAMPTZ DEFAULT NULL
) RETURNS SETOF quote_invoices LANGUAGE plpgsql AS $func$
DECLARE
  v_number INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_TOTAL_AMOUNT' USING ERRCODE = 'P0001';
  END IF;

  IF p_form_data_snapshot IS NULL THEN
    RAISE EXCEPTION 'FORM_SNAPSHOT_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  IF p_number IS NULL THEN
    SELECT COALESCE(MAX(number), 0) + 1
    INTO v_number
    FROM quote_invoices
    WHERE quote_id = p_quote_id AND deleted_at IS NULL;
  ELSE
    v_number := p_number;
  END IF;

  RETURN QUERY
  INSERT INTO quote_invoices (
    shop_id, quote_id, number, client, project, description,
    total_amount, form_data_snapshot, created_at
  ) VALUES (
    p_shop_id, p_quote_id, v_number, p_client, p_project, p_description,
    p_total_amount, p_form_data_snapshot, COALESCE(p_created_at, NOW())
  )
  RETURNING *;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'INVOICE_NUMBER_DUPLICATE' USING ERRCODE = '23505';
END;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_cuenta_cobro(
  p_shop_id    UUID,
  p_quote_id   UUID,
  p_invoice_id UUID,
  p_status     VARCHAR DEFAULT NULL,
  p_paid_at    TIMESTAMPTZ DEFAULT NULL
) RETURNS SETOF quote_invoices LANGUAGE plpgsql AS $func$
DECLARE
  v_actual quote_invoices%ROWTYPE;
BEGIN
  SELECT * INTO v_actual
  FROM quote_invoices
  WHERE id = p_invoice_id
    AND shop_id = p_shop_id
    AND quote_id = p_quote_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVOICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('pending', 'partial', 'paid') THEN
    RAISE EXCEPTION 'INVALID_INVOICE_STATUS' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  UPDATE quote_invoices SET
    status  = COALESCE(p_status, v_actual.status),
    paid_at = CASE
      WHEN p_paid_at IS NOT NULL THEN p_paid_at
      WHEN p_status = 'paid' AND v_actual.paid_at IS NULL THEN NOW()
      ELSE v_actual.paid_at
    END
  WHERE id = p_invoice_id
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_eliminar_cuenta_cobro(
  p_shop_id    UUID,
  p_quote_id   UUID,
  p_invoice_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM quote_invoices
    WHERE id = p_invoice_id
      AND shop_id = p_shop_id
      AND quote_id = p_quote_id
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'INVOICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE quote_invoices
  SET deleted_at = NOW()
  WHERE id = p_invoice_id;
END;
$func$;

COMMENT ON FUNCTION fn_listar_cuentas_cobro_cotizacion IS 'Lista cuentas de cobro activas de una cotización.';
COMMENT ON FUNCTION fn_obtener_cuenta_cobro IS 'Obtiene una cuenta de cobro por id dentro de una cotización.';
COMMENT ON FUNCTION sp_crear_cuenta_cobro IS 'Crea cuenta de cobro; auto-genera number si es NULL.';
COMMENT ON FUNCTION sp_actualizar_cuenta_cobro IS 'Actualiza estado y/o paid_at de una cuenta de cobro.';
COMMENT ON FUNCTION sp_eliminar_cuenta_cobro IS 'Soft delete de cuenta de cobro.';
