-- ============================================================
-- MÓDULO: Categories — Funciones y procedimientos
-- La lógica de unicidad de nombre y bloqueo por productos
-- activos vive aquí, no en la capa de aplicación.
-- ============================================================

-- ─── LECTURA ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_categorias(
  p_shop_id   UUID,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit     INTEGER DEFAULT 20,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id          UUID,
  shop_id     UUID,
  parent_id   UUID,
  name        VARCHAR,
  description TEXT,
  is_active   BOOLEAN,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, parent_id, name, description, is_active, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM categories
  WHERE shop_id = p_shop_id
    AND (p_is_active IS NULL OR is_active = p_is_active)
  ORDER BY name ASC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_categoria(
  p_shop_id     UUID,
  p_category_id UUID
) RETURNS SETOF categories LANGUAGE sql STABLE AS $func$
  SELECT * FROM categories WHERE id = p_category_id AND shop_id = p_shop_id;
$func$;

CREATE OR REPLACE FUNCTION fn_contar_productos_categoria(
  p_shop_id     UUID,
  p_category_id UUID
) RETURNS BIGINT LANGUAGE sql STABLE AS $func$
  SELECT COUNT(*) FROM products
  WHERE category_id = p_category_id AND shop_id = p_shop_id AND is_active = TRUE;
$func$;

-- ─── ESCRITURA ────────────────────────────────────────────────────────────────

-- sp_crear_categoria: valida nombre único dentro del mismo padre/tienda
CREATE OR REPLACE FUNCTION sp_crear_categoria(
  p_shop_id     UUID,
  p_name        VARCHAR,
  p_description TEXT    DEFAULT NULL,
  p_is_active   BOOLEAN DEFAULT TRUE,
  p_parent_id   UUID    DEFAULT NULL
) RETURNS SETOF categories LANGUAGE plpgsql AS $func$
BEGIN
  -- Verificar unicidad de nombre (parent_id NULL requiere manejo explícito
  -- porque UNIQUE no distingue NULL=NULL en PostgreSQL < 15)
  IF p_parent_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM categories
               WHERE name = p_name AND shop_id = p_shop_id AND parent_id IS NULL) THEN
      RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
    END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM categories
               WHERE name = p_name AND shop_id = p_shop_id AND parent_id = p_parent_id) THEN
      RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN QUERY
  INSERT INTO categories (shop_id, name, description, is_active, parent_id)
  VALUES (p_shop_id, p_name, p_description, p_is_active, p_parent_id)
  RETURNING *;
END;
$func$;

-- sp_actualizar_categoria: COALESCE + validación de nombre si cambió
CREATE OR REPLACE FUNCTION sp_actualizar_categoria(
  p_shop_id     UUID,
  p_category_id UUID,
  p_name        VARCHAR DEFAULT NULL,
  p_description TEXT    DEFAULT NULL,
  p_is_active   BOOLEAN DEFAULT NULL,
  p_parent_id   UUID    DEFAULT NULL
) RETURNS SETOF categories LANGUAGE plpgsql AS $func$
DECLARE
  v_actual     categories%ROWTYPE;
  v_parent_fin UUID;
BEGIN
  SELECT * INTO v_actual FROM categories WHERE id = p_category_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Si no se envía parent_id, mantener el actual
  v_parent_fin := CASE WHEN p_parent_id IS NOT NULL THEN p_parent_id ELSE v_actual.parent_id END;

  -- Validar nombre solo si cambia
  IF p_name IS NOT NULL AND p_name != v_actual.name THEN
    IF v_parent_fin IS NULL THEN
      IF EXISTS (SELECT 1 FROM categories
                 WHERE name = p_name AND shop_id = p_shop_id
                   AND parent_id IS NULL AND id != p_category_id) THEN
        RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
      END IF;
    ELSE
      IF EXISTS (SELECT 1 FROM categories
                 WHERE name = p_name AND shop_id = p_shop_id
                   AND parent_id = v_parent_fin AND id != p_category_id) THEN
        RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  RETURN QUERY
  UPDATE categories SET
    name        = COALESCE(p_name,        v_actual.name),
    description = COALESCE(p_description, v_actual.description),
    is_active   = COALESCE(p_is_active,   v_actual.is_active),
    parent_id   = v_parent_fin
  WHERE id = p_category_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- sp_eliminar_categoria: bloquea si tiene productos activos
CREATE OR REPLACE FUNCTION sp_eliminar_categoria(
  p_shop_id     UUID,
  p_category_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
DECLARE
  v_total BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'CATEGORY_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT fn_contar_productos_categoria(p_shop_id, p_category_id) INTO v_total;
  IF v_total > 0 THEN
    RAISE EXCEPTION 'CATEGORIA_CON_PRODUCTOS:%', v_total USING ERRCODE = 'P0001';
  END IF;

  UPDATE categories SET is_active = FALSE WHERE id = p_category_id AND shop_id = p_shop_id;
END;
$func$;

COMMENT ON FUNCTION fn_listar_categorias       IS 'Lista categorías paginadas de un tenant.';
COMMENT ON FUNCTION fn_obtener_categoria       IS 'Obtiene una categoría por id dentro del tenant.';
COMMENT ON FUNCTION fn_contar_productos_categoria IS 'Cuenta productos activos en una categoría.';
COMMENT ON FUNCTION sp_crear_categoria         IS 'Crea categoría con validación de nombre único por padre.';
COMMENT ON FUNCTION sp_actualizar_categoria    IS 'Actualiza categoría con COALESCE + validación de nombre.';
COMMENT ON FUNCTION sp_eliminar_categoria      IS 'Soft delete con bloqueo si tiene productos activos.';
