-- ============================================================
-- TABLA: payment_plans (Planes de pago reusables en el SaaS)
-- Aislamiento total por shop_id y cliente
-- ============================================================

CREATE TABLE payment_plans (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id       UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id   UUID          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  name          VARCHAR(120)  NOT NULL,   -- Ej: "50/30/20 Estándar"
  description   TEXT,
  installments  JSONB         NOT NULL,   -- [{ "name": "Firma", "percentage": 50, "order": 1 }, ...]
  
  is_default    BOOLEAN       DEFAULT false,
  
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger de updated_at
CREATE TRIGGER payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices de consulta rápida
CREATE INDEX idx_pp_shop ON payment_plans(shop_id);
CREATE INDEX idx_pp_customer ON payment_plans(shop_id, customer_id);

COMMENT ON TABLE payment_plans IS 'Planes de pago configurados por los clientes/usuarios del SaaS en cada tienda.';
