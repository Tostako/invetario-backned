-- ============================================================
-- TABLA: users (empleados/dueños de una tienda)
-- ============================================================
-- Un usuario siempre pertenece a exactamente una tienda (shop_id).
-- El rol define sus permisos dentro de esa tienda.

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id      UUID         NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email        CITEXT       NOT NULL,
  password     VARCHAR(255) NOT NULL,           -- bcrypt hash
  name         VARCHAR(100) NOT NULL,
  role         VARCHAR(20)  NOT NULL DEFAULT 'staff'
                            CHECK (role IN ('owner', 'admin', 'staff')),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Un email puede repetirse entre tiendas distintas, pero no dentro de la misma
  CONSTRAINT users_email_shop_unique UNIQUE (email, shop_id)
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
-- shop_id siempre va en el WHERE → índice en todas las tablas
CREATE INDEX idx_users_shop_id    ON users(shop_id);
CREATE INDEX idx_users_email      ON users(email);   -- login lookup
CREATE INDEX idx_users_shop_email ON users(shop_id, email); -- login multitenant

COMMENT ON TABLE users IS 'Usuarios pertenecientes a un tenant. El mismo email puede existir en distintas tiendas.';
COMMENT ON COLUMN users.shop_id IS 'FK obligatoria. Aísla el usuario a su tienda.';
