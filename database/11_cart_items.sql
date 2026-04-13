-- ============================================================
-- TABLA: cart_items (carrito de compras por usuario y tienda)
-- HU6 – Agregar al carrito | HU7 – Ver carrito
-- ============================================================

CREATE TABLE cart_items (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
  user_id     UUID          NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Un mismo usuario no puede tener el mismo producto dos veces en su carrito
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id, shop_id)
);

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_cart_items_shop_id   ON cart_items(shop_id);
CREATE INDEX idx_cart_items_user      ON cart_items(user_id, shop_id);
CREATE INDEX idx_cart_items_product   ON cart_items(shop_id, product_id);

COMMENT ON TABLE cart_items IS 'Carrito temporal por usuario. Se vacía al completar la compra (HU8).';
