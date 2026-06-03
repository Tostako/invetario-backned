-- ============================================================
-- TABLA: site_configs (configuración de landing page por tienda)
-- ============================================================
-- Key-value store para que cada tienda configure su landing page
-- sin tocar código. Admin gestiona, público solo lee.

CREATE TABLE site_configs (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Identificación de la config
  section     VARCHAR(50)   NOT NULL,  -- hero, about, services, footer, seo, theme
  key         VARCHAR(100)  NOT NULL,  -- title, subtitle, primary_color, cta_text

  -- Valor y tipo
  value       TEXT          NOT NULL,
  value_type  VARCHAR(20)   NOT NULL DEFAULT 'text' CHECK (value_type IN ('text', 'markdown', 'image_url', 'color', 'json', 'boolean')),

  -- Control
  active      BOOLEAN       NOT NULL DEFAULT TRUE,
  updated_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- La combinación section+key es única por tienda
  CONSTRAINT site_configs_shop_section_key_unique UNIQUE (shop_id, section, key)
);

CREATE TRIGGER site_configs_updated_at
  BEFORE UPDATE ON site_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_site_configs_shop_id     ON site_configs(shop_id);
CREATE INDEX idx_site_configs_section     ON site_configs(shop_id, section);
CREATE INDEX idx_site_configs_active      ON site_configs(shop_id, active);

COMMENT ON TABLE site_configs IS 'Configuración key-value de la landing page por tienda. Admin gestiona, público solo lee.';
COMMENT ON COLUMN site_configs.section    IS 'Sección de la landing: hero, about, services, footer, seo, theme';
COMMENT ON COLUMN site_configs.key      IS 'Clave dentro de la sección: title, subtitle, primary_color, etc.';
COMMENT ON COLUMN site_configs.value_type IS 'text | markdown | image_url | color | json | boolean';
