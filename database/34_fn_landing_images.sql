-- ============================================================
-- MÓDULO: Landing Images — Funciones y procedimientos almacenados
-- ============================================================

-- ─── LECTURA (Admin) ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_landing_images(
  p_shop_id   UUID,
  p_type      VARCHAR DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit     INTEGER DEFAULT 100,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id          UUID,
  shop_id     UUID,
  type        VARCHAR,
  url         TEXT,
  alt         VARCHAR,
  "order"     INTEGER,
  active      BOOLEAN,
  metadata    JSONB,
  uploaded_by UUID,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, type, url, alt, "order", active,
    metadata, uploaded_by, created_at, updated_at,
    COUNT(*) OVER() AS total_count
  FROM landing_images
  WHERE shop_id = p_shop_id
    AND (p_type      IS NULL OR type   = p_type)
    AND (p_is_active IS NULL OR active = p_is_active)
  ORDER BY type ASC, "order" ASC, created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_landing_image(
  p_shop_id  UUID,
  p_image_id UUID
) RETURNS SETOF landing_images LANGUAGE sql STABLE AS $func$
  SELECT * FROM landing_images WHERE id = p_image_id AND shop_id = p_shop_id;
$func$;

-- ─── LECTURA (Público) ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_listar_landing_images_publicas(
  p_shop_id UUID
) RETURNS TABLE (
  type        VARCHAR,
  url         TEXT,
  alt         VARCHAR,
  "order"     INTEGER,
  metadata    JSONB
) LANGUAGE sql STABLE AS $func$
  SELECT
    type, url, alt, "order", metadata
  FROM landing_images
  WHERE shop_id = p_shop_id
    AND active = TRUE
  ORDER BY type ASC, "order" ASC, created_at DESC;
$func$;

-- ─── ESCRITURA (Admin) ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sp_crear_landing_image(
  p_shop_id     UUID,
  p_type        VARCHAR,
  p_url         TEXT,
  p_alt         VARCHAR DEFAULT NULL,
  p_order       INTEGER DEFAULT 0,
  p_active      BOOLEAN DEFAULT TRUE,
  p_metadata    JSONB   DEFAULT NULL,
  p_uploaded_by UUID    DEFAULT NULL
) RETURNS SETOF landing_images LANGUAGE plpgsql AS $func$
BEGIN
  RETURN QUERY
  INSERT INTO landing_images (shop_id, type, url, alt, "order", active, metadata, uploaded_by)
  VALUES (p_shop_id, p_type, p_url, p_alt, p_order, p_active, p_metadata, p_uploaded_by)
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_actualizar_landing_image(
  p_shop_id     UUID,
  p_image_id    UUID,
  p_type        VARCHAR DEFAULT NULL,
  p_url         TEXT    DEFAULT NULL,
  p_alt         VARCHAR DEFAULT NULL,
  p_order       INTEGER DEFAULT NULL,
  p_active      BOOLEAN DEFAULT NULL,
  p_metadata    JSONB   DEFAULT NULL,
  p_uploaded_by UUID    DEFAULT NULL
) RETURNS SETOF landing_images LANGUAGE plpgsql AS $func$
DECLARE
  v_actual landing_images%ROWTYPE;
BEGIN
  SELECT * INTO v_actual FROM landing_images WHERE id = p_image_id AND shop_id = p_shop_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'IMAGE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  UPDATE landing_images SET
    type        = COALESCE(p_type,        v_actual.type),
    url         = COALESCE(p_url,         v_actual.url),
    alt         = COALESCE(p_alt,         v_actual.alt),
    "order"     = COALESCE(p_order,       v_actual."order"),
    active      = COALESCE(p_active,      v_actual.active),
    metadata    = COALESCE(p_metadata,    v_actual.metadata),
    uploaded_by = COALESCE(p_uploaded_by, v_actual.uploaded_by)
  WHERE id = p_image_id AND shop_id = p_shop_id
  RETURNING *;
END;
$func$;

CREATE OR REPLACE FUNCTION sp_eliminar_landing_image(
  p_shop_id  UUID,
  p_image_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $func$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM landing_images WHERE id = p_image_id AND shop_id = p_shop_id) THEN
    RAISE EXCEPTION 'IMAGE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE landing_images SET active = FALSE WHERE id = p_image_id AND shop_id = p_shop_id;
END;
$func$;

COMMENT ON FUNCTION fn_listar_landing_images          IS 'Lista imágenes paginadas del tenant (admin).';
COMMENT ON FUNCTION fn_obtener_landing_image          IS 'Obtiene una imagen por id (admin).';
COMMENT ON FUNCTION fn_listar_landing_images_publicas IS 'Lista imágenes activas del tenant (público).';
COMMENT ON FUNCTION sp_crear_landing_image             IS 'Registra nueva imagen de landing.';
COMMENT ON FUNCTION sp_actualizar_landing_image        IS 'Actualiza imagen con COALESCE.';
COMMENT ON FUNCTION sp_eliminar_landing_image          IS 'Soft delete de imagen.';
