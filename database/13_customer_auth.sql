-- ============================================================
-- MIGRACIÓN: Agregar campos de autenticación a customers
-- Permite login/register de clientes en cada tienda
-- ============================================================

-- Password hash (bcrypt, max 72 chars)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS password VARCHAR(72);

-- Último login
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Email OBLIGATORIO y ÚNICO por tienda para login
-- (antes era opcional — ahora es requerido para auth)
ALTER TABLE customers
  ALTER COLUMN email SET NOT NULL;

-- Un cliente no puede tener el mismo email en la misma tienda
-- Esto permite que el mismo email exista en tiendas diferentes (multitenant)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_shop_email_unique'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_shop_email_unique UNIQUE (shop_id, email);
  END IF;
END $$;

COMMENT ON COLUMN customers.password IS 'Hash bcrypt del password del cliente. NULL si fue creado por admin sin autenticación.';
COMMENT ON COLUMN customers.last_login IS 'Timestamp del último login exitoso del cliente.';
