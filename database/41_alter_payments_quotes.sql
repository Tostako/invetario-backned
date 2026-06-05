-- ============================================================
-- MIGRACIÓN: Alteración de payments y quotes para pagos manuales
-- ============================================================

-- 1) Hacer order_id nullable en payments
ALTER TABLE payments ALTER COLUMN order_id DROP NOT NULL;

-- 2) Ampliar los métodos de pago permitidos en la constraint de payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
  CHECK (method IN ('card', 'pse', 'manual', 'cash', 'transfer', 'wompi', 'other'));

-- 3) Ampliar los estados de pago permitidos en la constraint de payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process', 'confirmed'));

-- 4) Agregar campos para pagos manuales en payments
ALTER TABLE payments ADD COLUMN quote_id UUID NULL REFERENCES quotes(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN plan_installment_index INT NULL; -- index de cuota (0,1,2...)
ALTER TABLE payments ADD COLUMN notes TEXT; -- comentarios del pago
ALTER TABLE payments ADD COLUMN recorded_by UUID NULL REFERENCES users(id) ON DELETE SET NULL; -- usuario staff/admin que registró el pago

-- 5) Crear índices para acelerar búsquedas
CREATE INDEX idx_payments_quote_id ON payments(quote_id);

-- 6) Modificar tabla quotes para almacenar la relación con el plan de pagos
ALTER TABLE quotes ADD COLUMN payment_plan_id UUID NULL REFERENCES payment_plans(id) ON DELETE SET NULL;
CREATE INDEX idx_quotes_payment_plan_id ON quotes(payment_plan_id);

COMMENT ON COLUMN payments.quote_id IS 'FK opcional a quotes para pagos manuales de cotizaciones.';
COMMENT ON COLUMN payments.plan_installment_index IS 'Índice de la cuota pagada dentro del plan de pagos asociado.';
COMMENT ON COLUMN payments.recorded_by IS 'FK al usuario (staff/admin/owner) que registró y confirmó manualmente el pago.';
COMMENT ON COLUMN quotes.payment_plan_id IS 'FK al plan de pagos seleccionado para esta cotización.';
