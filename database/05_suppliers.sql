-- ============================================================
-- TABLA: suppliers (proveedores por tienda)
-- ============================================================

CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        VARCHAR(150)  NOT NULL,
  contact     VARCHAR(100),
  email       CITEXT,
  phone       VARCHAR(30),
  address     TEXT,
  notes       TEXT,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_suppliers_shop_id ON suppliers(shop_id);

COMMENT ON TABLE suppliers IS 'Proveedores de productos. Aislados por tienda.';
