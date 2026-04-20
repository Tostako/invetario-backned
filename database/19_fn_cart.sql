-- ============================================================
-- MÓDULO: Cart — Funciones y trigger de validación de stock
-- El carrito pertenece a customers (no a users).
-- Toda validación de disponibilidad de producto ocurre aquí.
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_ver_carrito(
  p_shop_id     UUID,
  p_customer_id UUID
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  customer_id     UUID,
  product_id      UUID,
  quantity        INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  product_sku     VARCHAR,
  unit_price      NUMERIC,
  stock_available INTEGER,
  subtotal        NUMERIC
) LANGUAGE sql STABLE AS $func$
  SELECT
    ci.id, ci.shop_id, ci.customer_id, ci.product_id,
    ci.quantity, ci.created_at, ci.updated_at,
    p.name   AS product_name,
    p.sku    AS product_sku,
    p.price  AS unit_price,
    p.stock  AS stock_available,
    (p.price * ci.quantity) AS subtotal
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id
  WHERE ci.shop_id     = p_shop_id
    AND ci.customer_id = p_customer_id
  ORDER BY ci.created_at ASC;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_item_carrito(
  p_shop_id     UUID,
  p_customer_id UUID,
  p_item_id     UUID
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  customer_id     UUID,
  product_id      UUID,
  quantity        INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  unit_price      NUMERIC,
  stock_available INTEGER
) LANGUAGE sql STABLE AS $func$
  SELECT
    ci.id, ci.shop_id, ci.customer_id, ci.product_id,
    ci.quantity, ci.created_at, ci.updated_at,
    p.name  AS product_name,
    p.price AS unit_price,
    p.stock AS stock_available
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id
  WHERE ci.id          = p_item_id
    AND ci.shop_id     = p_shop_id
    AND ci.customer_id = p_customer_id;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

-- sp_agregar_al_carrito: valida disponibilidad + upsert (suma cantidad si ya existe)
CREATE OR REPLACE FUNCTION sp_agregar_al_carrito(
  p_shop_id     UUID,
  p_customer_id UUID,
  p_product_id  UUID,
  p_quantity    INTEGER
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  customer_id     UUID,
  product_id      UUID,
  quantity        INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  product_sku     VARCHAR,
  unit_price      NUMERIC,
  stock_available INTEGER,
  subtotal        NUMERIC
) LANGUAGE plpgsql AS $func$
DECLARE
  v_produto RECORD;
BEGIN
  SELECT id, name, price, stock, is_active
  INTO v_produto
  FROM products WHERE id = p_product_id AND shop_id = p_shop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF NOT v_produto.is_active THEN
    RAISE EXCEPTION 'PRODUCTO_NO_DISPONIBLE' USING ERRCODE = 'P0001';
  END IF;
  IF p_quantity > v_produto.stock THEN
    RAISE EXCEPTION 'STOCK_INSUFICIENTE:%|%', v_produto.stock, p_quantity USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO cart_items (shop_id, customer_id, product_id, quantity)
  VALUES (p_shop_id, p_customer_id, p_product_id, p_quantity)
  ON CONFLICT (customer_id, product_id, shop_id)
  DO UPDATE SET
    quantity   = cart_items.quantity + EXCLUDED.quantity,
    updated_at = NOW();

  RETURN QUERY SELECT * FROM fn_ver_carrito(p_shop_id, p_customer_id)
               WHERE fn_ver_carrito.product_id = p_product_id;
END;
$func$;

-- sp_actualizar_cantidad_carrito: establece cantidad exacta + valida stock
CREATE OR REPLACE FUNCTION sp_actualizar_cantidad_carrito(
  p_shop_id     UUID,
  p_customer_id UUID,
  p_item_id     UUID,
  p_quantity    INTEGER
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  customer_id     UUID,
  product_id      UUID,
  quantity        INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  unit_price      NUMERIC,
  stock_available INTEGER
) LANGUAGE plpgsql AS $func$
DECLARE
  v_item    RECORD;
  v_stock   INTEGER;
BEGIN
  SELECT ci.*, p.stock
  INTO v_item
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id
  WHERE ci.id = p_item_id AND ci.shop_id = p_shop_id AND ci.customer_id = p_customer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CART_ITEM_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF p_quantity > v_item.stock THEN
    RAISE EXCEPTION 'STOCK_INSUFICIENTE:%|%', v_item.stock, p_quantity USING ERRCODE = 'P0001';
  END IF;

  UPDATE cart_items
  SET quantity = p_quantity, updated_at = NOW()
  WHERE id = p_item_id AND shop_id = p_shop_id AND customer_id = p_customer_id;

  -- Retornar el ítem actualizado con datos del producto
  RETURN QUERY SELECT * FROM fn_obtener_item_carrito(p_shop_id, p_customer_id, p_item_id);
END;
$func$;

-- sp_eliminar_item_carrito
CREATE OR REPLACE FUNCTION sp_eliminar_item_carrito(
  p_shop_id     UUID,
  p_customer_id UUID,
  p_item_id     UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cart_items
                 WHERE id = p_item_id AND shop_id = p_shop_id AND customer_id = p_customer_id) THEN
    RAISE EXCEPTION 'CART_ITEM_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM cart_items
  WHERE id = p_item_id AND shop_id = p_shop_id AND customer_id = p_customer_id;
END;
$func$;

-- sp_vaciar_carrito: limpia todo el carrito de un customer en una tienda
CREATE OR REPLACE FUNCTION sp_vaciar_carrito(
  p_shop_id     UUID,
  p_customer_id UUID
) RETURNS VOID LANGUAGE sql AS $func$
  DELETE FROM cart_items WHERE shop_id = p_shop_id AND customer_id = p_customer_id;
$func$;

-- ─── TRIGGER: Validar stock antes de insertar/actualizar carrito ──────────────
-- Capa de seguridad adicional a nivel de tabla.
-- Impide agregar más unidades de las disponibles aunque se llame SQL directo.

CREATE OR REPLACE FUNCTION fn_trigger_validar_stock_carrito()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
DECLARE
  v_stock     INTEGER;
  v_is_active BOOLEAN;
BEGIN
  SELECT stock, is_active INTO v_stock, v_is_active
  FROM products WHERE id = NEW.product_id AND shop_id = NEW.shop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF NOT v_is_active THEN
    RAISE EXCEPTION 'PRODUCTO_NO_DISPONIBLE' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.quantity > v_stock THEN
    RAISE EXCEPTION 'STOCK_INSUFICIENTE:%|%', v_stock, NEW.quantity USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_validar_stock_carrito ON cart_items;
CREATE TRIGGER trg_validar_stock_carrito
  BEFORE INSERT OR UPDATE OF quantity ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_validar_stock_carrito();

COMMENT ON FUNCTION fn_ver_carrito                IS 'Retorna ítems del carrito con info de producto. Aislado por shop_id + customer_id.';
COMMENT ON FUNCTION sp_agregar_al_carrito         IS 'Upsert en carrito con validación de stock y disponibilidad de producto.';
COMMENT ON FUNCTION sp_actualizar_cantidad_carrito IS 'Cambia cantidad en carrito validando stock disponible.';
COMMENT ON FUNCTION sp_eliminar_item_carrito      IS 'Elimina un ítem del carrito verificando pertenencia.';
COMMENT ON FUNCTION sp_vaciar_carrito             IS 'Vacía el carrito de un customer. Llamado al completar checkout.';
