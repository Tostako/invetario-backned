-- ============================================================
-- TABLA: payments (pagos procesados por Mercado Pago)
-- Soporta: tarjeta crédito/débito y PSE
-- ============================================================

CREATE TABLE payments (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id               UUID          NOT NULL REFERENCES shops(id)   ON DELETE CASCADE,
  order_id              UUID          NOT NULL REFERENCES orders(id)  ON DELETE RESTRICT,

  -- Referencia externa de Mercado Pago
  mp_payment_id         BIGINT        UNIQUE,

  -- Método de pago
  method                VARCHAR(20)   NOT NULL
                        CHECK (method IN ('card', 'pse')),

  -- Estado sincronizado con MP
  status                VARCHAR(30)   NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process')),
  status_detail         VARCHAR(60),

  -- Monto
  transaction_amount    NUMERIC(12,2) NOT NULL CHECK (transaction_amount > 0),

  -- URL de redirección para PSE
  external_resource_url TEXT,

  -- Respuesta cruda de MP para auditoría y soporte
  raw_response          JSONB,

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_payments_shop_id   ON payments(shop_id);
CREATE INDEX idx_payments_order_id  ON payments(order_id);
CREATE INDEX idx_payments_status    ON payments(shop_id, status);
CREATE INDEX idx_payments_mp_id     ON payments(mp_payment_id) WHERE mp_payment_id IS NOT NULL;

COMMENT ON TABLE payments IS 'Registro de pagos Mercado Pago (tarjeta y PSE) vinculados a órdenes.';
COMMENT ON COLUMN payments.raw_response IS 'Respuesta completa de MP para trazabilidad y resolución de disputas.';
