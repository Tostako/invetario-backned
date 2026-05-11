-- ============================================================
-- MIGRACIÓN: Categorías — agregar imagen de categoría
-- ============================================================

-- 1) Columna en tabla base
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2) Actualizar función de listado (cambia RETURNS TABLE)
DROP FUNCTION IF EXISTS fn_listar_categorias(UUID, BOOLEAN, INTEGER, INTEGER);

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
  image_url   TEXT,
  is_active   BOOLEAN,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, parent_id, name, description, image_url,
    is_active, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM categories
  WHERE shop_id = p_shop_id
    AND (p_is_active IS NULL OR is_active = p_is_active)
  ORDER BY name ASC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

-- 3) Actualizar procedures para que soporten image_url opcional
DROP FUNCTION IF EXISTS sp_crear_categoria(UUID, VARCHAR, TEXT, BOOLEAN, UUID);

CREATE OR REPLACE FUNCTION sp_crear_categoria(
  p_shop_id     UUID,
  p_name        VARCHAR,
  p_description TEXT    DEFAULT NULL,
  p_is_active   BOOLEAN DEFAULT TRUE,
  p_parent_id   UUID    DEFAULT NULL,
  p_image_url   TEXT    DEFAULT NULL
) RETURNS SETOF categories LANGUAGE plpgsql AS $func$
BEGIN
  -- Validación de unicidad de nombre (parent_id NULL requiere manejo explícito)
  IF p_parent_id IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM categories
      WHERE name = p_name AND shop_id = p_shop_id AND parent_id IS NULL
    ) THEN
      RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM categories
      WHERE name = p_name AND shop_id = p_shop_id AND parent_id = p_parent_id
    ) THEN
      RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN QUERY
  INSERT INTO categories (shop_id, name, description, is_active, parent_id, image_url)
  VALUES (p_shop_id, p_name, p_description, p_is_active, p_parent_id, p_image_url)
  RETURNING *;
END;
$func$;

DROP FUNCTION IF EXISTS sp_actualizar_categoria(UUID, UUID, VARCHAR, TEXT, BOOLEAN, UUID);

CREATE OR REPLACE FUNCTION sp_actualizar_categoria(
  p_shop_id     UUID,
  p_category_id UUID,
  p_name        VARCHAR  DEFAULT NULL,
  p_description TEXT    DEFAULT NULL,
  p_is_active   BOOLEAN DEFAULT NULL,
  p_parent_id   UUID    DEFAULT NULL,
  p_image_url   TEXT    DEFAULT NULL
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
      IF EXISTS (
        SELECT 1 FROM categories
        WHERE name = p_name AND shop_id = p_shop_id
          AND parent_id IS NULL AND id != p_category_id
      ) THEN
        RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
      END IF;
    ELSE
      IF EXISTS (
        SELECT 1 FROM categories
        WHERE name = p_name AND shop_id = p_shop_id
          AND parent_id = v_parent_fin AND id != p_category_id
      ) THEN
        RAISE EXCEPTION 'CATEGORIA_NOMBRE_DUPLICADO:%', p_name USING ERRCODE = '23505';
      END IF;
    END IF;
  END IF;

  RETURN QUERY
  UPDATE categories SET
    name        = COALESCE(p_name,        v_actual.name),
    description = COALESCE(p_description, v_actual.description),
    image_url   = COALESCE(p_image_url,   v_actual.image_url),
    is_active   = COALESCE(p_is_active,   v_actual.is_active),
    parent_id   = v_parent_fin
  WHERE id = p_category_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

-- No hace falta tocar fn_obtener_categoria:
-- retorna SETOF categories con SELECT * => incluye image_url automáticamente.

