-- ============================================================
-- TABLA: shops (raíz del multitenant — cada fila es un tenant)
-- ============================================================
-- shops es la tabla padre de TODO el sistema.
-- Cada registro representa una tienda independiente.
-- El shop_id de esta tabla es la FK que aparece en TODAS las demás.

CREATE TABLE shops (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(150)  NOT NULL,
  slug        CITEXT        NOT NULL UNIQUE,  -- identificador URL-friendly
  email       CITEXT        NOT NULL UNIQUE,
  phone       VARCHAR(30),
  address     TEXT,
  logo_url    TEXT,
  currency    CHAR(3)       NOT NULL DEFAULT 'USD',
  timezone    VARCHAR(60)   NOT NULL DEFAULT 'UTC',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  plan        VARCHAR(30)   NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente en todas las tablas
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE shops IS 'Tenant raíz. Cada tienda es un tenant aislado por shop_id.';
