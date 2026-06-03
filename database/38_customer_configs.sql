-- ============================================================
-- TABLA: customer_configs (configuración de precios por arquitecto/customer)
-- ============================================================
-- Cada customer (arquitecto/constructor) tiene exactamente UNA
-- configuración con sus precios personalizados, datos de facturación, etc.

CREATE TABLE customer_configs (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id          UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id      UUID          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Configuraciones JSONB
  services         JSONB         NOT NULL DEFAULT '{}',
  sub_packages     JSONB         NOT NULL DEFAULT '{}',
  complete_package JSONB         NOT NULL DEFAULT '{}',
  payment_plan     JSONB         NOT NULL DEFAULT '{}',
  invoice          JSONB         NOT NULL DEFAULT '{}',
  estimation       JSONB         NOT NULL DEFAULT '{}',

  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Un customer solo tiene una config
  CONSTRAINT customer_configs_customer_unique UNIQUE (shop_id, customer_id)
);

CREATE TRIGGER customer_configs_updated_at
  BEFORE UPDATE ON customer_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_customer_configs_shop_id     ON customer_configs(shop_id);
CREATE INDEX idx_customer_configs_customer    ON customer_configs(shop_id, customer_id);

COMMENT ON TABLE customer_configs IS 'Configuración personalizada de precios y datos por customer (arquitecto/constructor).';
COMMENT ON COLUMN customer_configs.services         IS 'JSONB con servicios y precios personalizados.';
COMMENT ON COLUMN customer_configs.sub_packages     IS 'JSONB con sub-paquetes.';
COMMENT ON COLUMN customer_configs.complete_package IS 'JSONB con paquete completo.';
COMMENT ON COLUMN customer_configs.payment_plan      IS 'JSONB con plan de pagos.';
COMMENT ON COLUMN customer_configs.invoice          IS 'JSONB con datos de empresa, representante, bancarios.';
COMMENT ON COLUMN customer_configs.estimation       IS 'JSONB con precios de obra negra, gris, acabados.';
