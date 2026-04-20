-- ============================================================
-- TABLA: super_admins (administradores globales de la plataforma)
-- ============================================================
-- Los super_admins NO pertenecen a ninguna tienda.
-- Tienen acceso de lectura/escritura a TODAS las tiendas.
-- Se almacenan en una tabla separada de 'users' para no contaminar
-- el modelo multitenant.

CREATE TABLE IF NOT EXISTS super_admins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       CITEXT        NOT NULL UNIQUE,
  password    TEXT          NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER super_admins_updated_at
  BEFORE UPDATE ON super_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE super_admins IS 'Administradores globales de la plataforma. Sin restricción por shop_id.';
