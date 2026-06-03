-- ============================================================
-- TABLA: landing_images (imágenes de la landing page por tienda)
-- ============================================================
-- Referencias a imágenes alojadas en Supabase Storage o CDN externo.
-- Admin gestiona, público solo lee.

CREATE TABLE landing_images (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Tipo y URL
  type        VARCHAR(30)   NOT NULL,  -- hero_bg, carousel, logo_main, logo_white, logo_abbreviated, about, service_card, cta_bg
  url         TEXT          NOT NULL,
  alt         VARCHAR(255),

  -- Orden y control
  "order"     INTEGER       NOT NULL DEFAULT 0,  -- orden de aparición (para carruseles)
  active      BOOLEAN       NOT NULL DEFAULT TRUE,

  -- Metadatos
  metadata    JSONB,                    -- { provider, publicId, width, height, mimeType, originalName, saasImageId }
  uploaded_by UUID          REFERENCES users(id) ON DELETE SET NULL,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER landing_images_updated_at
  BEFORE UPDATE ON landing_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_landing_images_shop_id   ON landing_images(shop_id);
CREATE INDEX idx_landing_images_type      ON landing_images(shop_id, type);
CREATE INDEX idx_landing_images_active    ON landing_images(shop_id, active);
CREATE INDEX idx_landing_images_order     ON landing_images(shop_id, type, "order");

COMMENT ON TABLE landing_images IS 'Imágenes de la landing page por tienda. URLs apuntan a Supabase Storage.';
COMMENT ON COLUMN landing_images.type        IS 'hero_bg | carousel | logo_main | logo_white | logo_abbreviated | about | service_card | cta_bg';
COMMENT ON COLUMN landing_images.metadata    IS 'Metadatos técnicos del archivo en JSONB.';
COMMENT ON COLUMN landing_images.uploaded_by IS 'FK al admin que subió la imagen.';
