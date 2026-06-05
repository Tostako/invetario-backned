-- ============================================================
-- MÓDULO: Payment Plans — Stored Procedures y Funciones
-- ============================================================

-- ─── ESCRITURA ───────────────────────────────────────────────────────────────

-- sp_crear_plan_pago: Inserta un nuevo plan de pago.
-- Si se marca como default, desactiva otros defaults del cliente en la tienda.
CREATE OR REPLACE FUNCTION sp_crear_plan_pago(
  p_shop_id       UUID,
  p_customer_id   UUID,
  p_name          VARCHAR,
  p_description   TEXT,
  p_installments  JSONB,
  p_is_default    BOOLEAN DEFAULT false
) RETURNS SETOF payment_plans LANGUAGE plpgsql AS $func$
BEGIN
  -- Verificar que el cliente existe y pertenece a la tienda
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'CUSTOMER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Si se marca como predeterminado, desmarcar los otros
  IF p_is_default THEN
    UPDATE payment_plans
    SET is_default = false
    WHERE shop_id = p_shop_id AND customer_id = p_customer_id;
  END IF;

  RETURN QUERY
  INSERT INTO payment_plans (shop_id, customer_id, name, description, installments, is_default)
  VALUES (p_shop_id, p_customer_id, p_name, p_description, p_installments, p_is_default)
  RETURNING *;
END;
$func$;

-- sp_actualizar_plan_pago: Actualiza un plan de pagos y mantiene coherencia de default.
CREATE OR REPLACE FUNCTION sp_actualizar_plan_pago(
  p_shop_id       UUID,
  p_plan_id       UUID,
  p_name          VARCHAR DEFAULT NULL,
  p_description   TEXT    DEFAULT NULL,
  p_installments  JSONB   DEFAULT NULL,
  p_is_default    BOOLEAN DEFAULT NULL
) RETURNS SETOF payment_plans LANGUAGE plpgsql AS $func$
DECLARE
  v_actual payment_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Si se marca como default, desactivar los otros
  IF COALESCE(p_is_default, v_actual.is_default) = true 
     AND (p_is_default IS TRUE OR v_actual.is_default IS FALSE) THEN
    UPDATE payment_plans
    SET is_default = false
    WHERE shop_id = p_shop_id AND customer_id = v_actual.customer_id AND id != p_plan_id;
  END IF;

  RETURN QUERY
  UPDATE payment_plans SET
    name         = COALESCE(p_name,         v_actual.name),
    description  = COALESCE(p_description,  v_actual.description),
    installments = COALESCE(p_installments, v_actual.installments),
    is_default   = COALESCE(p_is_default,   v_actual.is_default),
    updated_at   = NOW()
  WHERE id = p_plan_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- sp_eliminar_plan_pago: Elimina un plan de pago
CREATE OR REPLACE FUNCTION sp_eliminar_plan_pago(
  p_shop_id UUID,
  p_plan_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id;
END;
$func$;

-- sp_marcar_plan_pago_default: Marca un plan de pagos como predeterminado
CREATE OR REPLACE FUNCTION sp_marcar_plan_pago_default(
  p_shop_id UUID,
  p_plan_id UUID
) RETURNS SETOF payment_plans LANGUAGE plpgsql AS $func$
DECLARE
  v_actual payment_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Desactivar default para los otros planes de este cliente
  UPDATE payment_plans
  SET is_default = false
  WHERE shop_id = p_shop_id AND customer_id = v_actual.customer_id AND id != p_plan_id;

  -- Activar default en el plan seleccionado
  RETURN QUERY
  UPDATE payment_plans
  SET is_default = true, updated_at = NOW()
  WHERE id = p_plan_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

-- fn_listar_planes_pago: Lista planes de pago de la tienda (y opcionalmente por cliente)
CREATE OR REPLACE FUNCTION fn_listar_planes_pago(
  p_shop_id     UUID,
  p_customer_id UUID DEFAULT NULL
) RETURNS SETOF payment_plans LANGUAGE sql STABLE AS $func$
  SELECT * FROM payment_plans
  WHERE shop_id = p_shop_id
    AND (p_customer_id IS NULL OR customer_id = p_customer_id)
  ORDER BY is_default DESC, created_at DESC;
$func$;

-- fn_obtener_plan_pago: Obtiene un plan de pago por ID
CREATE OR REPLACE FUNCTION fn_obtener_plan_pago(
  p_shop_id UUID,
  p_plan_id UUID
) RETURNS SETOF payment_plans LANGUAGE sql STABLE AS $func$
  SELECT * FROM payment_plans WHERE id = p_plan_id AND shop_id = p_shop_id;
$func$;

COMMENT ON FUNCTION sp_crear_plan_pago         IS 'Crea un nuevo plan de pago para un cliente.';
COMMENT ON FUNCTION sp_actualizar_plan_pago    IS 'Actualiza campos de un plan de pagos.';
COMMENT ON FUNCTION sp_eliminar_plan_pago      IS 'Elimina un plan de pagos físicamente.';
COMMENT ON FUNCTION sp_marcar_plan_pago_default IS 'Establece un plan como default y quita defaults anteriores.';
COMMENT ON FUNCTION fn_listar_planes_pago      IS 'Lista todos los planes de pago, ordenando defaults primero.';
COMMENT ON FUNCTION fn_obtener_plan_pago       IS 'Obtiene un plan de pagos específico.';
