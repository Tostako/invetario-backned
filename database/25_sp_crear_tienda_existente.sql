-- ─── Crear tienda para un usuario ya existente (mismas credenciales) ──────────
-- Este SP permite que un dueño de tienda cree otra sin volver a registrarse.
-- Copia el hash de password, email y nombre del registro original.

CREATE OR REPLACE FUNCTION sp_crear_tienda_para_user_existente(
  p_shop_name      VARCHAR,
  p_shop_slug      CITEXT,
  p_shop_email     CITEXT,
  p_existing_user_id UUID
) RETURNS TABLE (shop_id UUID, user_id UUID) LANGUAGE plpgsql AS $func$
DECLARE
  v_shop_id UUID;
  v_user_id UUID;
  v_name    VARCHAR;
  v_email   CITEXT;
  v_password TEXT;
BEGIN
  -- Obtenemos los datos del usuario existente (basado en el ID del JWT)
  SELECT name, email, password INTO v_name, v_email, v_password
  FROM users WHERE id = p_existing_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'USER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- 1. Creamos la nueva tienda
  INSERT INTO shops (name, slug, email)
  VALUES (p_shop_name, p_shop_slug, p_shop_email)
  RETURNING id INTO v_shop_id;

  -- 2. Creamos el nuevo registro de usuario para esta tienda (clonamos owner)
  INSERT INTO users (shop_id, email, password, name, role)
  VALUES (v_shop_id, v_email, v_password, v_name, 'owner')
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT v_shop_id, v_user_id;
END;
$func$;

COMMENT ON FUNCTION sp_crear_tienda_para_user_existente IS 'Crea una tienda adicional para un usuario que ya es dueño de otra, clonando sus credenciales.';
