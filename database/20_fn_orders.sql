-- ============================================================
-- MÓDULO: Orders — Funciones, procedimientos y trigger de máquina de estados
-- La transacción completa de checkout (validar → crear → ajustar stock →
-- vaciar carrito) ocurre en sp_crear_pedido dentro del motor de BD.
-- El trigger trg_maquina_estados_pedido enforza transiciones válidas.
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_pedidos(
  p_shop_id     UUID,
  p_status      VARCHAR DEFAULT NULL,
  p_customer_id UUID    DEFAULT NULL,
  p_desde       TIMESTAMPTZ DEFAULT NULL,
  p_hasta       TIMESTAMPTZ DEFAULT NULL,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
) RETURNS TABLE (
  id             UUID,
  shop_id        UUID,
  customer_id    UUID,
  created_by     UUID,
  order_number   VARCHAR,
  status         VARCHAR,
  subtotal       NUMERIC,
  discount       NUMERIC,
  tax            NUMERIC,
  total          NUMERIC,
  notes          TEXT,
  created_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ,
  customer_name  VARCHAR,
  total_count    BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    o.id, o.shop_id, o.customer_id, o.created_by,
    o.order_number, o.status,
    o.subtotal, o.discount, o.tax, o.total,
    o.notes, o.created_at, o.updated_at,
    c.name AS customer_name,
    COUNT(*) OVER() AS total_count
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id AND c.shop_id = o.shop_id
  WHERE o.shop_id = p_shop_id
    AND (p_status      IS NULL OR o.status      = p_status)
    AND (p_customer_id IS NULL OR o.customer_id = p_customer_id)
    AND (p_desde       IS NULL OR o.created_at  >= p_desde)
    AND (p_hasta       IS NULL OR o.created_at  <= p_hasta)
  ORDER BY o.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_pedido(
  p_shop_id  UUID,
  p_order_id UUID
) RETURNS TABLE (
  id             UUID,
  shop_id        UUID,
  customer_id    UUID,
  created_by     UUID,
  order_number   VARCHAR,
  status         VARCHAR,
  subtotal       NUMERIC,
  discount       NUMERIC,
  tax            NUMERIC,
  total          NUMERIC,
  notes          TEXT,
  created_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ,
  customer_name  VARCHAR
) LANGUAGE sql STABLE AS $func$
  SELECT
    o.id, o.shop_id, o.customer_id, o.created_by,
    o.order_number, o.status,
    o.subtotal, o.discount, o.tax, o.total,
    o.notes, o.created_at, o.updated_at,
    c.name AS customer_name
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id AND c.shop_id = o.shop_id
  WHERE o.id = p_order_id AND o.shop_id = p_shop_id;
$func$;

CREATE OR REPLACE FUNCTION fn_listar_items_pedido(
  p_shop_id  UUID,
  p_order_id UUID
) RETURNS TABLE (
  id           UUID,
  shop_id      UUID,
  order_id     UUID,
  product_id   UUID,
  quantity     INTEGER,
  unit_price   NUMERIC,
  discount     NUMERIC,
  subtotal     NUMERIC,
  created_at   TIMESTAMPTZ,
  product_name VARCHAR,
  product_sku  VARCHAR
) LANGUAGE sql STABLE AS $func$
  SELECT
    oi.id, oi.shop_id, oi.order_id, oi.product_id,
    oi.quantity, oi.unit_price, oi.discount, oi.subtotal,
    oi.created_at,
    p.name AS product_name,
    p.sku  AS product_sku
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id AND oi.shop_id = p_shop_id;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

-- sp_crear_pedido: transacción completa de checkout
--   1. Valida cada ítem (existencia, is_active, stock)
--   2. Calcula totales
--   3. Genera número de orden legible
--   4. Inserta orden + ítems
--   5. Decrementa stock atómicamente + registra en inventory_movements
--   6. Vacía el carrito del customer (si p_customer_id no es NULL)
--
-- p_items: JSONB array de {product_id, quantity, discount}
-- La transacción es implícita — si algo falla, PostgreSQL hace rollback.

CREATE OR REPLACE FUNCTION sp_crear_pedido(
  p_shop_id     UUID,
  p_user_id     UUID,
  p_customer_id UUID,
  p_items       JSONB,
  p_notes       TEXT DEFAULT NULL
) RETURNS TABLE (order_id UUID, order_number VARCHAR, total NUMERIC) LANGUAGE plpgsql AS $func$
DECLARE
  v_item        RECORD;
  v_product     RECORD;
  v_order_id    UUID;
  v_order_num   VARCHAR(50);
  v_seq         BIGINT;
  v_subtotal    NUMERIC(12,2) := 0;
  v_descuento   NUMERIC(12,2) := 0;
  v_total       NUMERIC(12,2);
  v_item_sub    NUMERIC(12,2);
  v_filas       INTEGER;
  v_stock_antes INTEGER;
BEGIN
  -- 1. Validar todos los ítems y acumular totales
  FOR v_item IN
    SELECT (elem->>'product_id')::UUID  AS product_id,
           (elem->>'quantity')::INTEGER AS quantity,
           COALESCE((elem->>'discount')::NUMERIC, 0) AS discount
    FROM jsonb_array_elements(p_items) AS elem
  LOOP
    SELECT id, price, stock, is_active, name
    INTO v_product
    FROM products
    WHERE id = v_item.product_id AND shop_id = p_shop_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND:%', v_item.product_id USING ERRCODE = 'P0002';
    END IF;
    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'PRODUCTO_NO_DISPONIBLE:%', v_product.name USING ERRCODE = 'P0001';
    END IF;
    IF v_item.quantity > v_product.stock THEN
      RAISE EXCEPTION 'STOCK_INSUFICIENTE:"%"|%|%',
        v_product.name, v_product.stock, v_item.quantity USING ERRCODE = 'P0001';
    END IF;

    v_subtotal  := v_subtotal  + v_product.price * v_item.quantity;
    v_descuento := v_descuento + v_item.discount;
  END LOOP;

  v_total := v_subtotal - v_descuento;

  -- 2. Generar número de orden legible (ORD-YYYY-NNNN)
  SELECT COUNT(*) + 1 INTO v_seq FROM orders WHERE shop_id = p_shop_id;
  v_order_num := 'ORD-' || EXTRACT(YEAR FROM NOW())::TEXT
                         || '-' || LPAD(v_seq::TEXT, 4, '0');

  -- 3. Insertar orden
  INSERT INTO orders
    (shop_id, customer_id, created_by, order_number, status,
     subtotal, discount, tax, total, notes)
  VALUES
    (p_shop_id, p_customer_id, p_user_id, v_order_num, 'pending',
     v_subtotal, v_descuento, 0, v_total, p_notes)
  RETURNING id INTO v_order_id;

  -- 4. Insertar ítems + decrementar stock + registrar movimientos
  FOR v_item IN
    SELECT (elem->>'product_id')::UUID  AS product_id,
           (elem->>'quantity')::INTEGER AS quantity,
           COALESCE((elem->>'discount')::NUMERIC, 0) AS discount
    FROM jsonb_array_elements(p_items) AS elem
  LOOP
    SELECT price, stock INTO v_product
    FROM products WHERE id = v_item.product_id AND shop_id = p_shop_id;

    v_stock_antes := v_product.stock;
    v_item_sub    := v_product.price * v_item.quantity - v_item.discount;

    INSERT INTO order_items
      (shop_id, order_id, product_id, quantity, unit_price, discount, subtotal)
    VALUES
      (p_shop_id, v_order_id, v_item.product_id,
       v_item.quantity, v_product.price, v_item.discount, v_item_sub);

    -- Decremento atómico — la condición stock >= quantity garantiza consistencia
    UPDATE products
    SET stock = stock - v_item.quantity
    WHERE id = v_item.product_id AND shop_id = p_shop_id AND stock >= v_item.quantity;

    GET DIAGNOSTICS v_filas = ROW_COUNT;
    IF v_filas = 0 THEN
      RAISE EXCEPTION 'STOCK_INSUFICIENTE_CONCURRENTE:%', v_item.product_id USING ERRCODE = 'P0001';
    END IF;

    -- Auditoría de inventario
    INSERT INTO inventory_movements
      (shop_id, product_id, user_id, order_id, type, quantity, stock_before, stock_after)
    VALUES
      (p_shop_id, v_item.product_id, p_user_id, v_order_id,
       'sale', -v_item.quantity,
       v_stock_antes, v_stock_antes - v_item.quantity);
  END LOOP;

  -- 5. Vaciar carrito si hay customer
  IF p_customer_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE shop_id = p_shop_id AND customer_id = p_customer_id;
  END IF;

  RETURN QUERY SELECT v_order_id, v_order_num, v_total;
END;
$func$;

-- sp_actualizar_estado_pedido: la máquina de estados también la enforza el trigger,
-- pero este SP tiene la misma lógica para mayor claridad en errores desde Node.js.
CREATE OR REPLACE FUNCTION sp_actualizar_estado_pedido(
  p_shop_id  UUID,
  p_order_id UUID,
  p_status   VARCHAR,
  p_notes    TEXT DEFAULT NULL
) RETURNS SETOF orders LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- El trigger trg_maquina_estados_pedido enforza la transición válida.
  -- Si la transición es inválida, el trigger hará RAISE EXCEPTION.
  RETURN QUERY
  UPDATE orders SET
    status     = p_status,
    notes      = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_order_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- ─── TRIGGER: Máquina de estados de pedidos ───────────────────────────────────
-- Enforza que las transiciones de estado sean válidas a nivel de motor de BD.
-- Esto protege la integridad incluso si Node.js no valida (o si alguien
-- ejecuta SQL directo sobre la tabla).

CREATE OR REPLACE FUNCTION fn_trigger_maquina_estados_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
BEGIN
  -- Definición de transiciones válidas
  IF OLD.status = 'pending'   AND NEW.status IN ('confirmed', 'cancelled') THEN RETURN NEW; END IF;
  IF OLD.status = 'confirmed' AND NEW.status IN ('shipped',   'cancelled') THEN RETURN NEW; END IF;
  IF OLD.status = 'shipped'   AND NEW.status =  'delivered'                THEN RETURN NEW; END IF;

  -- Estados terminales no admiten transición
  IF OLD.status IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'TRANSICION_INVALIDA: el estado "%" es terminal — no puede cambiar a "%"',
      OLD.status, NEW.status USING ERRCODE = 'P0001';
  END IF;

  -- Cualquier otra combinación no permitida
  RAISE EXCEPTION 'TRANSICION_INVALIDA:% -> %', OLD.status, NEW.status USING ERRCODE = 'P0001';
END;
$func$;

DROP TRIGGER IF EXISTS trg_maquina_estados_pedido ON orders;
CREATE TRIGGER trg_maquina_estados_pedido
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION fn_trigger_maquina_estados_pedido();

COMMENT ON FUNCTION sp_crear_pedido              IS 'Checkout completo: valida stock, crea orden+ítems, ajusta stock, vacía carrito.';
COMMENT ON FUNCTION fn_listar_pedidos            IS 'Lista pedidos paginados con filtros de estado, cliente y fechas.';
COMMENT ON FUNCTION fn_obtener_pedido            IS 'Obtiene cabecera de un pedido con nombre de customer.';
COMMENT ON FUNCTION fn_listar_items_pedido       IS 'Lista ítems de un pedido con info de producto.';
COMMENT ON FUNCTION sp_actualizar_estado_pedido  IS 'Actualiza estado del pedido (el trigger enforza transiciones válidas).';
