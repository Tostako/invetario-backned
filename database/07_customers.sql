-- ============================================================
-- TABLA: customers (clientes de una tienda)
-- ============================================================

CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID         NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  email       CITEXT,
  phone       VARCHAR(30),
  address     TEXT,
  notes       TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_customers_shop_id    ON customers(shop_id);
CREATE INDEX idx_customers_shop_email ON customers(shop_id, email);

COMMENT ON TABLE customers IS 'Clientes por tienda. Un mismo email puede existir en varias tiendas.';
