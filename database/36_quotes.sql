-- ============================================================
-- TABLA: quotes (cotizaciones de clientes/arquitectos por tienda)
-- ============================================================
-- Cada customer (arquitecto/constructor) genera cotizaciones
-- dentro de su tienda. Aislamiento total por customer_id.

CREATE TABLE quotes (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Cliente que genera la cotización (FK a customers)
  customer_id UUID          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Datos del proyecto
  client      VARCHAR(255)  NOT NULL,
  project     VARCHAR(255)  NOT NULL,
  area        NUMERIC(12,2) NOT NULL,
  price       NUMERIC(12,2) NOT NULL,

  -- Estado y datos
  status      VARCHAR(20)   NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'completed')),
  data        JSONB         NOT NULL DEFAULT '{}',

  -- Fecha visible para el usuario
  date        DATE          NOT NULL DEFAULT CURRENT_DATE,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_quotes_shop_id       ON quotes(shop_id);
CREATE INDEX idx_quotes_customer_id   ON quotes(shop_id, customer_id);
CREATE INDEX idx_quotes_status        ON quotes(shop_id, status);
CREATE INDEX idx_quotes_created       ON quotes(shop_id, created_at DESC);

COMMENT ON TABLE quotes IS 'Cotizaciones generadas por customers (arquitectos/constructores) de una tienda.';
COMMENT ON COLUMN quotes.customer_id IS 'FK al customer/arquitecto que creó la cotización.';
COMMENT ON COLUMN quotes.data       IS 'JSONB con todos los datos del wizard de cotización.';
COMMENT ON COLUMN quotes.status   IS 'draft | sent | paid | completed';
