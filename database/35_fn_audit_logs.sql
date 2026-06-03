-- ============================================================
-- MÓDULO: Audit Logs — Funciones de lectura
-- ============================================================
-- Solo lectura. La escritura se hace vía sp_registrar_auditoria
-- desde otros procedimientos o controllers.

CREATE OR REPLACE FUNCTION fn_listar_audit_logs(
  p_shop_id   UUID,
  p_entity    VARCHAR DEFAULT NULL,
  p_user_id   UUID    DEFAULT NULL,
  p_limit     INTEGER DEFAULT 50,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id          UUID,
  shop_id     UUID,
  action      VARCHAR,
  entity      VARCHAR,
  entity_id   VARCHAR,
  old_value   TEXT,
  new_value   TEXT,
  user_id     UUID,
  created_at  TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE sql STABLE AS $func$
  SELECT
    id, shop_id, action, entity, entity_id,
    old_value, new_value, user_id, created_at,
    COUNT(*) OVER() AS total_count
  FROM audit_logs
  WHERE shop_id = p_shop_id
    AND (p_entity  IS NULL OR entity  = p_entity)
    AND (p_user_id IS NULL OR user_id = p_user_id)
  ORDER BY created_at DESC
  LIMIT  p_limit
  OFFSET p_offset;
$func$;

CREATE OR REPLACE FUNCTION fn_obtener_audit_log(
  p_shop_id UUID,
  p_log_id  UUID
) RETURNS SETOF audit_logs LANGUAGE sql STABLE AS $func$
  SELECT * FROM audit_logs WHERE id = p_log_id AND shop_id = p_shop_id;
$func$;

COMMENT ON FUNCTION fn_listar_audit_logs IS 'Lista logs paginados del tenant (admin).';
COMMENT ON FUNCTION fn_obtener_audit_log  IS 'Obtiene un log por id (admin).';
