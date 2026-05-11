-- ============================================================
-- MIGRACION: Pagos estaticos sin pasarela de pago externa
-- Amplia los metodos permitidos y hace mp_payment_id opcional.
-- ============================================================

-- 1) Extender metodos de pago permitidos
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_method_check
    CHECK (method IN ('cash', 'card', 'transfer', 'pse', 'other'));

-- 2) Hacer mp_payment_id opcional
-- Ya era BIGINT sin NOT NULL, no requiere cambio.

-- 3) Reemplazar sp_insertar_pago para que acepte el monto directamente.
--
-- IMPORTANTE:
-- CREATE OR REPLACE no reemplaza una funcion si cambia la firma; crea una
-- sobrecarga. Por eso eliminamos primero las firmas conocidas para evitar:
-- ERROR 42725: function name "sp_insertar_pago" is not unique.
DROP FUNCTION IF EXISTS sp_insertar_pago(
  UUID,
  UUID,
  BIGINT,
  VARCHAR,
  VARCHAR,
  NUMERIC,
  VARCHAR,
  TEXT,
  JSONB
);

DROP FUNCTION IF EXISTS sp_insertar_pago(
  UUID,
  UUID,
  VARCHAR,
  NUMERIC,
  VARCHAR,
  VARCHAR,
  BIGINT,
  TEXT,
  JSONB
);

CREATE OR REPLACE FUNCTION sp_insertar_pago(
  p_shop_id               UUID,
  p_order_id              UUID,
  p_method                VARCHAR,
  p_transaction_amount    NUMERIC,
  p_status                VARCHAR DEFAULT 'approved',
  p_status_detail         VARCHAR DEFAULT NULL,
  p_mp_payment_id         BIGINT  DEFAULT NULL,
  p_external_resource_url TEXT    DEFAULT NULL,
  p_raw_response          JSONB   DEFAULT NULL
) RETURNS SETOF payments LANGUAGE sql AS $func$
  INSERT INTO payments
    (shop_id, order_id, method, status, status_detail,
     mp_payment_id, transaction_amount, external_resource_url, raw_response)
  VALUES
    (p_shop_id, p_order_id, p_method, p_status, p_status_detail,
     p_mp_payment_id, p_transaction_amount, p_external_resource_url, p_raw_response)
  RETURNING *;
$func$;

-- 4) Actualizar comentarios con firma explicita para evitar ambiguedad.
COMMENT ON FUNCTION sp_insertar_pago(
  UUID,
  UUID,
  VARCHAR,
  NUMERIC,
  VARCHAR,
  VARCHAR,
  BIGINT,
  TEXT,
  JSONB
) IS 'Registra un pago estatico (sin pasarela). mp_payment_id es opcional.';

-- 5) En pagos estaticos el pago puede nacer directamente como approved.
-- El trigger anterior solo corria en UPDATE, asi que no confirmaba el pedido
-- cuando sp_insertar_pago insertaba el pago ya aprobado.
CREATE OR REPLACE FUNCTION fn_trigger_pago_aprobado_confirma_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
BEGIN
  IF NEW.status = 'approved'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE orders
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = NEW.order_id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_pago_aprobado_confirma_pedido ON payments;
CREATE TRIGGER trg_pago_aprobado_confirma_pedido
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_pago_aprobado_confirma_pedido();
