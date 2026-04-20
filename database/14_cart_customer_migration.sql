-- ============================================================
-- MIGRACIÓN: Cambiar cart_items de user_id a customer_id
-- El carrito ahora pertenece a customers, no a users (empleados)
-- ============================================================

-- 1. Limpiar datos existentes del carrito (estamos en desarrollo)
DELETE FROM cart_items;

-- 2. Eliminar constraint, índices y trigger del esquema anterior
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_product_unique;
DROP INDEX IF EXISTS idx_cart_items_user;

-- 3. Eliminar la columna user_id
ALTER TABLE cart_items DROP COLUMN IF EXISTS user_id;

-- 4. Agregar la columna customer_id (IF NOT EXISTS para idempotencia)
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE;

-- 5. Nuevo constraint UNIQUE: un customer no puede tener el mismo producto dos veces
ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_customer_product_unique UNIQUE (customer_id, product_id, shop_id);

-- 6. Nuevos índices
CREATE INDEX idx_cart_items_customer ON cart_items(customer_id, shop_id);

COMMENT ON TABLE cart_items IS 'Carrito temporal por cliente (customer). Se vacía al completar la compra (HU8).';
