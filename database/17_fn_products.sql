-- ============================================================
-- MÓDULO: Products — Funciones, procedimientos y triggers
-- Arquitectura Database-Centric:
--   - Validaciones de integridad de negocio en el motor DB
--   - Trigger de movimientos de inventario automático
--   - No se permite SQL ad-hoc sobre las tablas: solo estas funciones
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_productos(
  p_shop_id     UUID,
  p_search      TEXT    DEFAULT NULL,
  p_category_id UUID    DEFAULT NULL,
  p_supplier_id UUID    DEFAULT NULL,
  p_low_stock   BOOLEAN DEFAULT FALSE,
  p_is_active   BOOLEAN DEFAULT TRUE,
  p_limit       INTEGER DEFAULT 20,
  p_offset      INTEGER DEFAULT 0
) RETURNS TABLE (
  id            UUID,
  shop_id       UUID,
  category_id   UUID,
  supplier_id   UUID,
  sku           VARCHAR,
  name          VARCHAR,
  description   TEXT,
  image_url     TEXT,
  price         NUMERIC,
  cost          NUMERIC,
  stock         INTEGER,
  stock_min     INTEGER,
  stock_max     INTEGER,
  unit          VARCHAR,
  is_active     BOOLEAN,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  category_name VARCHAR,
  supplier_name VARCHAR,
  total_count   BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    p.id, p.shop_id, p.category_id, p.supplier_id,
    p.sku, p.name, p.description, p.image_url,
    p.price, p.cost, p.stock, p.stock_min, p.stock_max,
    p.unit, p.is_active, p.created_at, p.updated_at,
    c.name  AS category_name,
    s.name  AS supplier_name,
    COUNT(*) OVER() AS total_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
  LEFT JOIN suppliers  s ON s.id = p.supplier_id  AND s.shop_id = p.shop_id
  WHERE p.shop_id   = p_shop_id
    AND p.is_active = COALESCE(p_is_active, TRUE)
    AND (p_search      IS NULL OR p.name ILIKE '%' || p_search || '%'
                               OR p.sku  ILIKE '%' || p_search || '%')
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_supplier_id IS NULL OR p.supplier_id = p_supplier_id)
    AND (NOT COALESCE(p_low_stock, FALSE) OR p.stock <= p.stock_min)
  ORDER BY p.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_producto(
  p_shop_id    UUID,
  p_product_id UUID
) RETURNS TABLE (
  id            UUID,
  shop_id       UUID,
  category_id   UUID,
  supplier_id   UUID,
  sku           VARCHAR,
  name          VARCHAR,
  description   TEXT,
  image_url     TEXT,
  price         NUMERIC,
  cost          NUMERIC,
  stock         INTEGER,
  stock_min     INTEGER,
  stock_max     INTEGER,
  unit          VARCHAR,
  is_active     BOOLEAN,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  category_name VARCHAR,
  supplier_name VARCHAR
) LANGUAGE sql STABLE AS $func$
  SELECT
    p.id, p.shop_id, p.category_id, p.supplier_id,
    p.sku, p.name, p.description, p.image_url,
    p.price, p.cost, p.stock, p.stock_min, p.stock_max,
    p.unit, p.is_active, p.created_at, p.updated_at,
    c.name AS category_name,
    s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
  LEFT JOIN suppliers  s ON s.id = p.supplier_id  AND s.shop_id = p.shop_id
  WHERE p.id      = p_product_id
    AND p.shop_id = p_shop_id;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

-- sp_crear_producto: valida SKU único y stock_max > stock_min antes de insertar
CREATE OR REPLACE FUNCTION sp_crear_producto(
  p_shop_id     UUID,
  p_sku         VARCHAR,
  p_name        VARCHAR,
  p_price       NUMERIC,
  p_stock       INTEGER,
  p_stock_min   INTEGER,
  p_description TEXT    DEFAULT NULL,
  p_image_url   TEXT    DEFAULT NULL,
  p_category_id UUID    DEFAULT NULL,
  p_supplier_id UUID    DEFAULT NULL,
  p_cost        NUMERIC DEFAULT NULL,
  p_stock_max   INTEGER DEFAULT NULL,
  p_unit        VARCHAR DEFAULT 'unit'
) RETURNS SETOF products LANGUAGE plpgsql AS $func$
DECLARE
  v_sku_upper VARCHAR := UPPER(p_sku);
BEGIN
  -- Validar SKU único dentro de la tienda
  IF EXISTS (SELECT 1 FROM products WHERE sku = v_sku_upper AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'SKU_DUPLICADO:%', v_sku_upper USING ERRCODE = '23505';
  END IF;

  -- Validar coherencia de stock
  IF p_stock_max IS NOT NULL AND p_stock_max <= p_stock_min THEN
    RAISE EXCEPTION 'STOCK_MAX_INVALIDO: stock_max debe ser mayor que stock_min' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  INSERT INTO products
    (shop_id, sku, name, description, image_url, category_id, supplier_id,
     price, cost, stock, stock_min, stock_max, unit)
  VALUES
    (p_shop_id, v_sku_upper, p_name, p_description, p_image_url,
     p_category_id, p_supplier_id,
     p_price, p_cost, p_stock, p_stock_min, p_stock_max, p_unit)
  RETURNING *;
END;
$func$;

-- sp_actualizar_producto: COALESCE preserva campos no enviados
CREATE OR REPLACE FUNCTION sp_actualizar_producto(
  p_shop_id     UUID,
  p_product_id  UUID,
  p_sku         VARCHAR  DEFAULT NULL,
  p_name        VARCHAR  DEFAULT NULL,
  p_description TEXT     DEFAULT NULL,
  p_image_url   TEXT     DEFAULT NULL,
  p_category_id UUID     DEFAULT NULL,
  p_supplier_id UUID     DEFAULT NULL,
  p_price       NUMERIC  DEFAULT NULL,
  p_cost        NUMERIC  DEFAULT NULL,
  p_stock       INTEGER  DEFAULT NULL,
  p_stock_min   INTEGER  DEFAULT NULL,
  p_stock_max   INTEGER  DEFAULT NULL,
  p_unit        VARCHAR  DEFAULT NULL
) RETURNS SETOF products LANGUAGE plpgsql AS $func$
DECLARE
  v_sku_upper   VARCHAR;
  v_actual      products%ROWTYPE;
  v_final_min   INTEGER;
  v_final_max   INTEGER;
BEGIN
  SELECT * INTO v_actual FROM products WHERE id = p_product_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  v_sku_upper := COALESCE(UPPER(p_sku), v_actual.sku);

  -- Validar SKU único si cambió
  IF UPPER(p_sku) IS NOT NULL AND UPPER(p_sku) != v_actual.sku THEN
    IF EXISTS (SELECT 1 FROM products
               WHERE sku = v_sku_upper AND shop_id = p_shop_id AND id != p_product_id) THEN
      RAISE EXCEPTION 'SKU_DUPLICADO:%', v_sku_upper USING ERRCODE = '23505';
    END IF;
  END IF;

  -- Validar coherencia de stock con valores finales
  v_final_min := COALESCE(p_stock_min, v_actual.stock_min);
  v_final_max := COALESCE(p_stock_max, v_actual.stock_max);
  IF v_final_max IS NOT NULL AND v_final_max <= v_final_min THEN
    RAISE EXCEPTION 'STOCK_MAX_INVALIDO: stock_max debe ser mayor que stock_min' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  UPDATE products SET
    sku         = v_sku_upper,
    name        = COALESCE(p_name,        v_actual.name),
    description = COALESCE(p_description, v_actual.description),
    image_url   = COALESCE(p_image_url,   v_actual.image_url),
    category_id = COALESCE(p_category_id, v_actual.category_id),
    supplier_id = COALESCE(p_supplier_id, v_actual.supplier_id),
    price       = COALESCE(p_price,       v_actual.price),
    cost        = COALESCE(p_cost,        v_actual.cost),
    stock       = COALESCE(p_stock,       v_actual.stock),
    stock_min   = v_final_min,
    stock_max   = v_final_max,
    unit        = COALESCE(p_unit,        v_actual.unit)
  WHERE id = p_product_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- sp_eliminar_producto: soft delete — preserva historial en order_items
CREATE OR REPLACE FUNCTION sp_eliminar_producto(
  p_shop_id    UUID,
  p_product_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE products SET is_active = FALSE
  WHERE id = p_product_id AND shop_id = p_shop_id;
END;
$func$;

-- sp_ajustar_stock: ajuste atómico + registro de movimiento de inventario
CREATE OR REPLACE FUNCTION sp_ajustar_stock(
  p_shop_id    UUID,
  p_product_id UUID,
  p_delta      INTEGER,   -- positivo = entrada, negativo = salida
  p_user_id    UUID,
  p_tipo       VARCHAR,   -- 'purchase','sale','adjustment','return','loss'
  p_order_id   UUID    DEFAULT NULL,
  p_notas      TEXT    DEFAULT NULL
) RETURNS SETOF products LANGUAGE plpgsql AS $func$
DECLARE
  v_stock_antes INTEGER;
  v_producto    products%ROWTYPE;
BEGIN
  SELECT stock INTO v_stock_antes
  FROM products WHERE id = p_product_id AND shop_id = p_shop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- La condición (stock + delta) >= 0 garantiza no quedar en negativo
  UPDATE products
  SET stock = stock + p_delta
  WHERE id = p_product_id AND shop_id = p_shop_id AND (stock + p_delta) >= 0
  RETURNING * INTO v_producto;

  IF v_producto IS NULL THEN
    RAISE EXCEPTION 'STOCK_NEGATIVO: el ajuste resultaría en stock negativo' USING ERRCODE = 'P0001';
  END IF;

  -- Auditoría inmutable de inventario
  INSERT INTO inventory_movements
    (shop_id, product_id, user_id, order_id, type, quantity, stock_before, stock_after, notes)
  VALUES
    (p_shop_id, p_product_id, p_user_id, p_order_id,
     p_tipo, p_delta, v_stock_antes, v_stock_antes + p_delta, p_notas);

  RETURN NEXT v_producto;
END;
$func$;

-- ─── TRIGGER: Alerta de stock bajo ──────────────────────────────────────────
-- Se dispara cuando el stock cae a stock_min o por debajo.
-- Actualmente registra en el log de PostgreSQL; puede extenderse
-- para insertar en una tabla stock_alerts o enviar a pg_notify.

CREATE OR REPLACE FUNCTION fn_trigger_alerta_stock_bajo()
RETURNS TRIGGER LANGUAGE plpgsql AS $func$
BEGIN
  IF NEW.stock <= NEW.stock_min AND OLD.stock > OLD.stock_min THEN
    RAISE WARNING '[STOCK_BAJO] Producto % (tienda %) — stock: %, mínimo: %',
      NEW.name, NEW.shop_id, NEW.stock, NEW.stock_min;
  END IF;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_alerta_stock_bajo ON products;
CREATE TRIGGER trg_alerta_stock_bajo
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION fn_trigger_alerta_stock_bajo();

COMMENT ON FUNCTION fn_listar_productos     IS 'Lista productos paginados con filtros. Filtra por shop_id (multitenancy).';
COMMENT ON FUNCTION fn_obtener_producto     IS 'Obtiene un producto con joins a categoría y proveedor.';
COMMENT ON FUNCTION sp_crear_producto       IS 'Crea producto validando SKU único y coherencia de stock.';
COMMENT ON FUNCTION sp_actualizar_producto  IS 'Actualiza producto con COALESCE — preserva campos no enviados.';
COMMENT ON FUNCTION sp_eliminar_producto    IS 'Soft delete de producto. Preserva historial en order_items.';
COMMENT ON FUNCTION sp_ajustar_stock        IS 'Ajuste atómico de stock con registro de movimiento de inventario.';
