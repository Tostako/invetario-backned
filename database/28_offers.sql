-- ============================================================
-- TABLA: offers (ofertas y promociones por tienda)
-- ============================================================
-- Sistema de promociones flexible: puede aplicar descuento por
-- porcentaje o monto fijo, a toda la tienda, categoría o producto.

CREATE TABLE offers (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id         UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Identificación
  title           VARCHAR(200)  NOT NULL,
  description     TEXT,

  -- Descuento
  discount_type   VARCHAR(20)   NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value  NUMERIC(12,2) NOT NULL CHECK (discount_value >= 0),

  -- Ámbito de aplicación
  scope           VARCHAR(20)   NOT NULL CHECK (scope IN ('storewide', 'category', 'product')),
  product_id      UUID          REFERENCES products(id) ON DELETE CASCADE,
  category_id     UUID          REFERENCES categories(id) ON DELETE CASCADE,

  -- Código promocional opcional (ej. "VERANO25")
  code            VARCHAR(50),

  -- Vigencia
  starts_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ   NOT NULL,

  -- Control
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  usage_limit     INTEGER                CHECK (usage_limit >= 0),
  usage_count     INTEGER       NOT NULL DEFAULT 0 CHECK (usage_count >= 0),

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- El código promocional es único por tienda (si existe)
  CONSTRAINT offers_code_shop_unique UNIQUE (code, shop_id),
  -- Restricción de consistencia de ámbito
  CONSTRAINT offers_scope_consistency CHECK (
    (scope = 'product'  AND product_id  IS NOT NULL AND category_id IS NULL) OR
    (scope = 'category' AND category_id IS NOT NULL AND product_id  IS NULL) OR
    (scope = 'storewide' AND product_id IS NULL     AND category_id IS NULL)
  ),
  -- Validación de fechas
  CONSTRAINT offers_dates_check CHECK (ends_at > starts_at),
  -- Validación de porcentaje máximo razonable
  CONSTRAINT offers_percentage_check CHECK (
    discount_type != 'percentage' OR discount_value <= 100
  )
);

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_offers_shop_id       ON offers(shop_id);
CREATE INDEX idx_offers_active_dates  ON offers(shop_id, is_active, starts_at, ends_at);
CREATE INDEX idx_offers_code          ON offers(shop_id, code);
CREATE INDEX idx_offers_product       ON offers(shop_id, product_id) WHERE scope = 'product';
CREATE INDEX idx_offers_category      ON offers(shop_id, category_id) WHERE scope = 'category';

COMMENT ON TABLE offers IS 'Ofertas y promociones por tienda. Soporta descuentos por porcentaje o monto fijo.';
COMMENT ON COLUMN offers.discount_type IS 'percentage | fixed_amount';
COMMENT ON COLUMN offers.scope         IS 'storewide | category | product';
COMMENT ON COLUMN offers.code          IS 'Código promocional opcional, único por tienda.';
