-- ============================================================
-- MÓDULO: Payments — Funciones y trigger de confirmación automática
-- La integración con Mercado Pago (llamadas HTTP) permanece en Node.js.
-- La persistencia y la lógica reactiva (aprobar → confirmar pedido)
-- viven aquí.
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_obtener_pago_por_orden(
  p_shop_id  UUID,
  p_order_id UUID
) RETURNS SETOF payments LANGUAGE sql STABLE AS $func$
  SELECT * FROM payments
  WHERE shop_id = p_shop_id AND order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_pago_por_id(
  p_shop_id    UUID,
  p_payment_id UUID
) RETURNS SETOF payments LANGUAGE sql STABLE AS $func$
  SELECT * FROM payments WHERE id = p_payment_id AND shop_id = p_shop_id;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

-- sp_insertar_pago: registra un nuevo pago asociado a una orden
-- NOTA: p_transaction_amount va antes de los parámetros con DEFAULT
--       para cumplir la regla de PostgreSQL (42P13).
CREATE OR REPLACE FUNCTION sp_insertar_pago(
  p_shop_id               UUID,
  p_order_id              UUID,
  p_mp_payment_id         BIGINT,
  p_method                VARCHAR,
  p_status                VARCHAR,
  p_transaction_amount    NUMERIC,
  p_status_detail         VARCHAR  DEFAULT NULL,
  p_external_resource_url TEXT     DEFAULT NULL,
  p_raw_response          JSONB    DEFAULT NULL
) RETURNS SETOF payments LANGUAGE sql AS $func$
  INSERT INTO payments
    (shop_id, order_id, mp_payment_id, method, status, status_detail,
     transaction_amount, external_resource_url, raw_response)
  VALUES
    (p_shop_id, p_order_id, p_mp_payment_id, p_method, p_status, p_status_detail,
     p_transaction_amount, p_external_resource_url, p_raw_response)
  RETURNING *;
$func$;

-- sp_actualizar_estado_pago: sincroniza el estado desde el webhook de Mercado Pago
CREATE OR REPLACE FUNCTION sp_actualizar_estado_pago(
  p_mp_payment_id BIGINT,
  p_status        VARCHAR,
  p_status_detail VARCHAR DEFAULT NULL,
  p_raw_response  JSONB   DEFAULT NULL
) RETURNS SETOF payments LANGUAGE sql AS $func$
  UPDATE payments SET
    status        = p_status,
    status_detail = p_status_detail,
    raw_response  = p_raw_response,
    updated_at    = NOW()
  WHERE mp_payment_id = p_mp_payment_id
  RETURNING *;
$func$;

-- ─── TRIGGER: Pago aprobado → confirmar pedido automáticamente ───────────────
-- Cuando Mercado Pago confirma un pago (status = 'approved'),
-- el pedido correspondiente pasa de 'pending' a 'confirmed' sin
-- necesidad de intervención de la capa de aplicación.
-- Esto garantiza consistencia incluso si Node.js cae durante el webhook.

CREATE OR REPLACE FUNCTION fn_trigger_pago_aprobado_confirma_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE orders
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = NEW.order_id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_pago_aprobado_confirma_pedido ON payments;
CREATE TRIGGER trg_pago_aprobado_confirma_pedido
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_pago_aprobado_confirma_pedido();

COMMENT ON FUNCTION sp_insertar_pago              IS 'Registra un pago recibido de Mercado Pago.';
COMMENT ON FUNCTION sp_actualizar_estado_pago     IS 'Sincroniza estado de pago desde webhook de MP.';
COMMENT ON FUNCTION fn_obtener_pago_por_orden     IS 'Último pago de una orden (para verificar si ya fue pagado).';
COMMENT ON FUNCTION fn_obtener_pago_por_id        IS 'Obtiene pago por UUID interno.';
