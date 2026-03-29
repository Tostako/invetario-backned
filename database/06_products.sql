-- ============================================================
-- TABLA: products (inventario de productos por tienda)
-- ============================================================
-- Tabla central del sistema. Todo acceso DEBE filtrar por shop_id.

CREATE TABLE products (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id          UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id      UUID          REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id      UUID          REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Identificación
  sku              VARCHAR(100)  NOT NULL,
  name             VARCHAR(200)  NOT NULL,
  description      TEXT,
  image_url        TEXT,

  -- Precios
  price            NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  cost             NUMERIC(12,2)          CHECK (cost >= 0),

  -- Stock
  stock            INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_min        INTEGER       NOT NULL DEFAULT 0 CHECK (stock_min >= 0),  -- alerta de stock bajo
  stock_max        INTEGER                CHECK (stock_max > 0),             -- límite de reorden

  -- Control
  unit             VARCHAR(30)   NOT NULL DEFAULT 'unit',  -- unit, kg, liter, box...
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- SKU único dentro de la misma tienda (puede repetirse entre tiendas distintas)
  CONSTRAINT products_sku_shop_unique UNIQUE (sku, shop_id)
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
-- shop_id: presente en absolutamente todas las queries
CREATE INDEX idx_products_shop_id     ON products(shop_id);
-- Búsqueda por nombre (ILIKE)
CREATE INDEX idx_products_shop_name   ON products(shop_id, name);
-- Filtrado por categoría dentro de una tienda
CREATE INDEX idx_products_category    ON products(shop_id, category_id);
-- Detección de stock bajo: WHERE shop_id = X AND stock <= stock_min
CREATE INDEX idx_products_low_stock   ON products(shop_id, stock, stock_min);
-- Búsqueda por SKU
CREATE INDEX idx_products_sku         ON products(shop_id, sku);

COMMENT ON TABLE products IS 'Inventario de productos. shop_id es obligatorio en TODAS las queries.';
COMMENT ON COLUMN products.shop_id   IS 'FK obligatoria. Aísla los productos de cada tienda.';
COMMENT ON COLUMN products.sku       IS 'Código único del producto dentro de la tienda.';
COMMENT ON COLUMN products.stock_min IS 'Stock mínimo. Si stock <= stock_min se genera alerta.';
