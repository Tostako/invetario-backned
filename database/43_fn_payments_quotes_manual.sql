-- ============================================================
-- MÓDULO: Quotes & Manual Payments — Stored Procedures & Triggers
-- ============================================================

-- ─── RECREAR fn_listar_cotizaciones PARA INCLUIR payment_plan_id ──────────────

-- Primero eliminamos la función anterior con su firma original para evitar conflictos
DROP FUNCTION IF EXISTS fn_listar_cotizaciones(UUID, UUID, VARCHAR, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION fn_listar_cotizaciones(
  p_shop_id     UUID,
  p_customer_id UUID    DEFAULT NULL,   -- NULL = admin ve todas
  p_status      VARCHAR DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  customer_id     UUID,
  client          VARCHAR,
  project         VARCHAR,
  area            NUMERIC,
  price           NUMERIC,
  status          VARCHAR,
  data            JSONB,
  date            DATE,
  payment_plan_id UUID,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  total_count     BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, customer_id, client, project, area, price, status,
    data, date, payment_plan_id, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM quotes
  WHERE shop_id = p_shop_id
    AND (p_customer_id IS NULL OR customer_id = p_customer_id)
    AND (p_status      IS NULL OR status     = p_status)
  ORDER BY created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

-- ─── PROCEDIMIENTOS ALMACENADOS ──────────────────────────────────────────────

-- sp_asignar_plan_cotizacion: Asocia un plan de pagos a una cotización
CREATE OR REPLACE FUNCTION sp_asignar_plan_cotizacion(
  p_shop_id   UUID,
  p_quote_id  UUID,
  p_plan_id   UUID
) RETURNS SETOF quotes LANGUAGE plpgsql AS $func$
DECLARE
  v_quote quotes%ROWTYPE;
  v_new_data JSONB;
BEGIN
  -- Verificar cotización
  SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Verificar plan de pagos si no es NULL
  IF p_plan_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Actualizar JSONB data
  IF p_plan_id IS NOT NULL THEN
    v_new_data = jsonb_set(v_quote.data, '{paymentPlanId}', to_jsonb(p_plan_id::text));
  ELSE
    v_new_data = v_quote.data - 'paymentPlanId';
  END IF;

  RETURN QUERY
  UPDATE quotes
  SET payment_plan_id = p_plan_id,
      data = v_new_data,
      updated_at = NOW()
  WHERE id = p_quote_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- sp_registrar_pago_manual_cotizacion: Inserta un pago manual asociado a una cotización.
CREATE OR REPLACE FUNCTION sp_registrar_pago_manual_cotizacion(
  p_shop_id               UUID,
  p_quote_id              UUID,
  p_method                VARCHAR,
  p_transaction_amount    NUMERIC,
  p_plan_installment_idx  INT,
  p_notes                 TEXT,
  p_recorded_by           UUID
) RETURNS SETOF payments LANGUAGE plpgsql AS $func$
BEGIN
  -- Verificar cotización
  IF NOT EXISTS (SELECT 1 FROM quotes WHERE id = p_quote_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'QUOTE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  INSERT INTO payments (
    shop_id,
    order_id,
    quote_id,
    method,
    status,
    status_detail,
    transaction_amount,
    plan_installment_index,
    notes,
    recorded_by
  ) VALUES (
    p_shop_id,
    NULL,
    p_quote_id,
    p_method,
    'confirmed',
    'manual_confirmed',
    p_transaction_amount,
    p_plan_installment_idx,
    p_notes,
    p_recorded_by
  ) RETURNING *;
END;
$func$;

-- fn_listar_pagos_cotizacion: Lista todos los pagos registrados para una cotización
CREATE OR REPLACE FUNCTION fn_listar_pagos_cotizacion(
  p_shop_id  UUID,
  p_quote_id UUID
) RETURNS SETOF payments LANGUAGE sql STABLE AS $func$
  SELECT * FROM payments
  WHERE shop_id = p_shop_id AND quote_id = p_quote_id
  ORDER BY created_at DESC;
$func$;

-- ─── TRIGGER: Pago registrado/confirmado → actualizar estado cotización a paid ───

CREATE OR REPLACE FUNCTION fn_trigger_pago_cotizacion_actualiza_estado()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
DECLARE
  v_quote_price NUMERIC;
  v_total_paid  NUMERIC;
BEGIN
  -- Solo actuar si el pago está asociado a una cotización
  IF NEW.quote_id IS NOT NULL THEN
    -- Obtener el precio de la cotización
    SELECT price INTO v_quote_price FROM quotes WHERE id = NEW.quote_id;
    
    -- Calcular el total pagado confirmado o aprobado
    SELECT COALESCE(SUM(transaction_amount), 0) INTO v_total_paid
    FROM payments
    WHERE quote_id = NEW.quote_id AND status IN ('approved', 'confirmed');
    
    -- Si el total pagado cubre o excede el precio de la cotización, cambiar estado a 'paid'
    IF v_total_paid >= v_quote_price THEN
      UPDATE quotes
      SET status = 'paid', updated_at = NOW()
      WHERE id = NEW.quote_id AND status != 'paid';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_pago_cotizacion_actualiza_estado ON payments;
CREATE TRIGGER trg_pago_cotizacion_actualiza_estado
  AFTER INSERT OR UPDATE OF status, transaction_amount ON payments
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_pago_cotizacion_actualiza_estado();

COMMENT ON FUNCTION fn_listar_cotizaciones(UUID, UUID, VARCHAR, INTEGER, INTEGER) IS 'Lista cotizaciones incluyendo payment_plan_id.';
COMMENT ON FUNCTION sp_asignar_plan_cotizacion IS 'Asocia un plan de pago a una cotización.';
COMMENT ON FUNCTION sp_registrar_pago_manual_cotizacion IS 'Registra y confirma manualmente un pago para una cuota de cotización.';
COMMENT ON FUNCTION fn_listar_pagos_cotizacion IS 'Lista los pagos manuales recibidos para una cotización.';
