-- ============================================================
-- TABLA: quote_invoices (cuentas de cobro por cotización)
-- ============================================================

CREATE TABLE quote_invoices (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id             UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  quote_id            UUID          NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  number              INTEGER       NOT NULL,
  client              VARCHAR(255)  NOT NULL,
  project             VARCHAR(255)  NOT NULL,
  description         TEXT          NOT NULL,
  total_amount        NUMERIC(14,2) NOT NULL CHECK (total_amount > 0),
  status              VARCHAR(20)   NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'partial', 'paid')),
  form_data_snapshot  JSONB         NOT NULL,
  paid_at             TIMESTAMPTZ,

  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT quote_invoices_quote_number_unique UNIQUE (quote_id, number)
);

CREATE TRIGGER quote_invoices_updated_at
  BEFORE UPDATE ON quote_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_quote_invoices_shop_id   ON quote_invoices(shop_id);
CREATE INDEX idx_quote_invoices_quote_id  ON quote_invoices(quote_id);
CREATE INDEX idx_quote_invoices_status    ON quote_invoices(shop_id, quote_id, status);
CREATE INDEX idx_quote_invoices_created   ON quote_invoices(quote_id, created_at DESC);

COMMENT ON TABLE quote_invoices IS 'Cuentas de cobro generadas a partir de cotizaciones.';
COMMENT ON COLUMN quote_invoices.form_data_snapshot IS 'Snapshot JSONB del formulario al momento de crear la cuenta de cobro.';
COMMENT ON COLUMN quote_invoices.deleted_at IS 'Soft delete; NULL = activa.';
