-- ============================================================
-- TABLAS: orders + order_items (ventas por tienda)
-- ============================================================

CREATE TABLE orders (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id       UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id   UUID          REFERENCES customers(id) ON DELETE SET NULL,
  created_by    UUID          NOT NULL REFERENCES users(id),  -- empleado que registró la venta

  -- Número de orden legible (ej: ORD-2024-0001)
  order_number  VARCHAR(50)   NOT NULL,

  status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),

  -- Totales (desnormalizados para evitar recalcular en reportes)
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),

  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT orders_number_shop_unique UNIQUE (order_number, shop_id)
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Líneas de la orden ───────────────────────────────────────────────────────
CREATE TABLE order_items (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_id    UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES products(id),

  -- Snapshot del precio al momento de la venta (el precio puede cambiar después)
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  discount    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  subtotal    NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),  -- (unit_price * qty) - discount

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_shop_id       ON orders(shop_id);
CREATE INDEX idx_orders_customer      ON orders(shop_id, customer_id);
CREATE INDEX idx_orders_status        ON orders(shop_id, status);
CREATE INDEX idx_orders_created_at    ON orders(shop_id, created_at DESC);  -- reportes temporales

CREATE INDEX idx_order_items_shop_id  ON order_items(shop_id);
CREATE INDEX idx_order_items_order    ON order_items(order_id);
CREATE INDEX idx_order_items_product  ON order_items(shop_id, product_id);  -- ventas por producto

COMMENT ON TABLE orders IS 'Órdenes de venta. El shop_id se replica también en order_items para queries directas.';
COMMENT ON COLUMN order_items.shop_id IS 'Redundante pero necesario para queries de análisis sin JOIN con orders.';
