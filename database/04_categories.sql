-- ============================================================
-- TABLA: categories (categorías de productos por tienda)
-- ============================================================
-- Soporte para categorías anidadas (parent_id) con un nivel de profundidad
-- controlado a nivel de aplicación.

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID         NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  parent_id   UUID         REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- El nombre de categoría es único dentro de la misma tienda y mismo padre
  CONSTRAINT categories_name_shop_unique UNIQUE (name, shop_id, parent_id)
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_categories_shop_id  ON categories(shop_id);
CREATE INDEX idx_categories_parent   ON categories(parent_id);

COMMENT ON TABLE categories IS 'Categorías de productos. Soporte para un nivel de anidamiento.';
COMMENT ON COLUMN categories.shop_id IS 'FK obligatoria. Cada tienda gestiona sus propias categorías.';
