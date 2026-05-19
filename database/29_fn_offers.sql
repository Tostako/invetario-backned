-- ============================================================
-- MÓDULO: Offers — Funciones y procedimientos almacenados
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_ofertas(
  p_shop_id   UUID,
  p_is_active BOOLEAN DEFAULT NULL,
  p_scope     VARCHAR DEFAULT NULL,
  p_limit     INTEGER DEFAULT 20,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  title           VARCHAR,
  description     TEXT,
  discount_type   VARCHAR,
  discount_value  NUMERIC,
  scope           VARCHAR,
  product_id      UUID,
  category_id     UUID,
  code            VARCHAR,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN,
  usage_limit     INTEGER,
  usage_count     INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  category_name   VARCHAR,
  total_count     BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    o.id, o.shop_id, o.title, o.description,
    o.discount_type, o.discount_value, o.scope,
    o.product_id, o.category_id, o.code,
    o.starts_at, o.ends_at, o.is_active,
    o.usage_limit, o.usage_count,
    o.created_at, o.updated_at,
    p.name  AS product_name,
    c.name  AS category_name,
    COUNT(*) OVER() AS total_count
  FROM offers o
  LEFT JOIN products   p ON p.id = o.product_id  AND p.shop_id = o.shop_id
  LEFT JOIN categories c ON c.id = o.category_id AND c.shop_id = o.shop_id
  WHERE o.shop_id = p_shop_id
    AND (p_is_active IS NULL OR o.is_active = p_is_active)
    AND (p_scope     IS NULL OR o.scope     = p_scope)
  ORDER BY o.created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_oferta(
  p_shop_id  UUID,
  p_offer_id UUID
) RETURNS TABLE (
  id              UUID,
  shop_id         UUID,
  title           VARCHAR,
  description     TEXT,
  discount_type   VARCHAR,
  discount_value  NUMERIC,
  scope           VARCHAR,
  product_id      UUID,
  category_id     UUID,
  code            VARCHAR,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN,
  usage_limit     INTEGER,
  usage_count     INTEGER,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  product_name    VARCHAR,
  category_name   VARCHAR
) LANGUAGE sql STABLE AS $func$
  SELECT
    o.id, o.shop_id, o.title, o.description,
    o.discount_type, o.discount_value, o.scope,
    o.product_id, o.category_id, o.code,
    o.starts_at, o.ends_at, o.is_active,
    o.usage_limit, o.usage_count,
    o.created_at, o.updated_at,
    p.name  AS product_name,
    c.name  AS category_name
  FROM offers o
  LEFT JOIN products   p ON p.id = o.product_id  AND p.shop_id = o.shop_id
  LEFT JOIN categories c ON c.id = o.category_id AND c.shop_id = o.shop_id
  WHERE o.id = p_offer_id AND o.shop_id = p_shop_id;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sp_crear_oferta(
  p_shop_id        UUID,
  p_title          VARCHAR,
  p_discount_type  VARCHAR,
  p_discount_value NUMERIC,
  p_scope          VARCHAR,
  p_starts_at      TIMESTAMPTZ,
  p_ends_at        TIMESTAMPTZ,
  p_description    TEXT    DEFAULT NULL,
  p_product_id     UUID    DEFAULT NULL,
  p_category_id    UUID    DEFAULT NULL,
  p_code           VARCHAR DEFAULT NULL,
  p_is_active      BOOLEAN DEFAULT TRUE,
  p_usage_limit    INTEGER DEFAULT NULL
) RETURNS SETOF offers LANGUAGE plpgsql AS $func$
BEGIN
  -- Validar código único por tienda
  IF p_code IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM offers WHERE code = UPPER(TRIM(p_code)) AND shop_id = p_shop_id) THEN
      RAISE EXCEPTION 'CODIGO_DUPLICADO:%', UPPER(TRIM(p_code)) USING ERRCODE = '23505';
    END IF;
  END IF;

  -- Validar consistencia de scope vs IDs
  IF p_scope = 'product' AND p_product_id IS NULL THEN
    RAISE EXCEPTION 'PRODUCTO_REQUERIDO: scope=product requiere product_id' USING ERRCODE = 'P0001';
  END IF;
  IF p_scope = 'category' AND p_category_id IS NULL THEN
    RAISE EXCEPTION 'CATEGORIA_REQUERIDA: scope=category requiere category_id' USING ERRCODE = 'P0001';
  END IF;
  IF p_scope = 'storewide' AND (p_product_id IS NOT NULL OR p_category_id IS NOT NULL) THEN
    RAISE EXCEPTION 'AMBITO_INVALIDO: scope=storewide no admite product_id ni category_id' USING ERRCODE = 'P0001';
  END IF;

  -- Validar que el producto exista y pertenezca a la tienda
  IF p_product_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND shop_id = p_shop_id) THEN
      RAISE EXCEPTION 'PRODUCTO_NO_ENCONTRADO' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- Validar que la categoría exista y pertenezca a la tienda
  IF p_category_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id AND shop_id = p_shop_id) THEN
      RAISE EXCEPTION 'CATEGORIA_NO_ENCONTRADA' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  RETURN QUERY
  INSERT INTO offers
    (shop_id, title, description, discount_type, discount_value, scope,
     product_id, category_id, code, starts_at, ends_at, is_active, usage_limit)
  VALUES
    (p_shop_id, p_title, p_description, p_discount_type, p_discount_value, p_scope,
     p_product_id, p_category_id, UPPER(TRIM(p_code)), p_starts_at, p_ends_at, p_is_active, p_usage_limit)
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_oferta(
  p_shop_id        UUID,
  p_offer_id       UUID,
  p_title          VARCHAR  DEFAULT NULL,
  p_description    TEXT     DEFAULT NULL,
  p_discount_type  VARCHAR  DEFAULT NULL,
  p_discount_value NUMERIC  DEFAULT NULL,
  p_scope          VARCHAR  DEFAULT NULL,
  p_product_id     UUID     DEFAULT NULL,
  p_category_id    UUID     DEFAULT NULL,
  p_code           VARCHAR  DEFAULT NULL,
  p_starts_at      TIMESTAMPTZ DEFAULT NULL,
  p_ends_at        TIMESTAMPTZ DEFAULT NULL,
  p_is_active      BOOLEAN  DEFAULT NULL,
  p_usage_limit    INTEGER  DEFAULT NULL
) RETURNS SETOF offers LANGUAGE plpgsql AS $func$
DECLARE
  v_actual      offers%ROWTYPE;
  v_scope_fin   VARCHAR;
  v_code_fin    VARCHAR;
BEGIN
  SELECT * INTO v_actual FROM offers WHERE id = p_offer_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'OFFER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  v_scope_fin := COALESCE(p_scope, v_actual.scope);
  v_code_fin  := CASE WHEN p_code IS NOT NULL THEN UPPER(TRIM(p_code)) ELSE v_actual.code END;

  -- Validar código único si cambia
  IF v_code_fin IS NOT NULL AND v_code_fin != COALESCE(v_actual.code, '') THEN
    IF EXISTS (SELECT 1 FROM offers WHERE code = v_code_fin AND shop_id = p_shop_id AND id != p_offer_id) THEN
      RAISE EXCEPTION 'CODIGO_DUPLICADO:%', v_code_fin USING ERRCODE = '23505';
    END IF;
  END IF;

  -- Validar consistencia de scope vs IDs finales
  IF v_scope_fin = 'product' AND COALESCE(p_product_id, v_actual.product_id) IS NULL THEN
    RAISE EXCEPTION 'PRODUCTO_REQUERIDO: scope=product requiere product_id' USING ERRCODE = 'P0001';
  END IF;
  IF v_scope_fin = 'category' AND COALESCE(p_category_id, v_actual.category_id) IS NULL THEN
    RAISE EXCEPTION 'CATEGORIA_REQUERIDA: scope=category requiere category_id' USING ERRCODE = 'P0001';
  END IF;
  IF v_scope_fin = 'storewide' AND (COALESCE(p_product_id, v_actual.product_id) IS NOT NULL OR COALESCE(p_category_id, v_actual.category_id) IS NOT NULL) THEN
    RAISE EXCEPTION 'AMBITO_INVALIDO: scope=storewide no admite product_id ni category_id' USING ERRCODE = 'P0001';
  END IF;

  -- Validar existencia del producto si se envía o ya existe en scope product
  IF v_scope_fin = 'product' THEN
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = COALESCE(p_product_id, v_actual.product_id) AND shop_id = p_shop_id) THEN
      RAISE EXCEPTION 'PRODUCTO_NO_ENCONTRADO' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- Validar existencia de la categoría si se envía o ya existe en scope category
  IF v_scope_fin = 'category' THEN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE id = COALESCE(p_category_id, v_actual.category_id) AND shop_id = p_shop_id) THEN
      RAISE EXCEPTION 'CATEGORIA_NO_ENCONTRADA' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  RETURN QUERY
  UPDATE offers SET
    title          = COALESCE(p_title,          v_actual.title),
    description    = COALESCE(p_description,    v_actual.description),
    discount_type  = COALESCE(p_discount_type,  v_actual.discount_type),
    discount_value = COALESCE(p_discount_value, v_actual.discount_value),
    scope          = v_scope_fin,
    product_id     = CASE WHEN v_scope_fin = 'storewide' THEN NULL ELSE COALESCE(p_product_id, v_actual.product_id) END,
    category_id    = CASE WHEN v_scope_fin = 'storewide' THEN NULL ELSE COALESCE(p_category_id, v_actual.category_id) END,
    code           = v_code_fin,
    starts_at      = COALESCE(p_starts_at,      v_actual.starts_at),
    ends_at        = COALESCE(p_ends_at,        v_actual.ends_at),
    is_active      = COALESCE(p_is_active,      v_actual.is_active),
    usage_limit    = COALESCE(p_usage_limit,    v_actual.usage_limit)
  WHERE id = p_offer_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_eliminar_oferta(
  p_shop_id  UUID,
  p_offer_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM offers WHERE id = p_offer_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'OFFER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE offers SET is_active = FALSE WHERE id = p_offer_id AND shop_id = p_shop_id;
END;
$func$;

-- ─── PÚBLICO: Ofertas activas para clientes ───────────────────────────────────

DROP FUNCTION IF EXISTS fn_listar_ofertas_publicas(UUID);

CREATE OR REPLACE FUNCTION fn_listar_ofertas_publicas(
  p_shop_id UUID
) RETURNS TABLE (
  id              UUID,
  title           VARCHAR,
  description     TEXT,
  discount_type   VARCHAR,
  discount_value  NUMERIC,
  scope           VARCHAR,
  product_id      UUID,
  category_id     UUID,
  code            VARCHAR,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  product_name    VARCHAR,
  category_name   VARCHAR,
  product_image   TEXT,
  product_price   NUMERIC
) LANGUAGE sql STABLE AS $func$
  SELECT
    o.id, o.title, o.description,
    o.discount_type, o.discount_value, o.scope,
    o.product_id, o.category_id, o.code,
    o.starts_at, o.ends_at,
    p.name   AS product_name,
    c.name   AS category_name,
    p.image_url AS product_image,
    p.price  AS product_price
  FROM offers o
  LEFT JOIN products   p ON p.id = o.product_id  AND p.shop_id = o.shop_id AND p.is_active = TRUE
  LEFT JOIN categories c ON c.id = o.category_id AND c.shop_id = o.shop_id AND c.is_active = TRUE
  WHERE o.shop_id   = p_shop_id
    AND o.is_active = TRUE
    AND o.starts_at <= NOW()
    AND o.ends_at   > NOW()
    AND (o.usage_limit IS NULL OR o.usage_count < o.usage_limit)
  ORDER BY o.discount_value DESC, o.created_at DESC;
$func$;

COMMENT ON FUNCTION fn_listar_ofertas           IS 'Lista ofertas paginadas con joins a producto/categoría.';
COMMENT ON FUNCTION fn_obtener_oferta           IS 'Obtiene una oferta por id dentro del tenant.';
COMMENT ON FUNCTION sp_crear_oferta             IS 'Crea oferta validando código único, scope y existencia de referencias.';
COMMENT ON FUNCTION sp_actualizar_oferta        IS 'Actualiza oferta con COALESCE + validaciones de integridad.';
COMMENT ON FUNCTION sp_eliminar_oferta          IS 'Soft delete de oferta.';
COMMENT ON FUNCTION fn_listar_ofertas_publicas  IS 'Lista ofertas activas y vigentes para el catálogo público de clientes.';
