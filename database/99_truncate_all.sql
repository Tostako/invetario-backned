-- ============================================================
-- TRUNCATE: Limpiar TODA la base de datos sin eliminar tablas
-- ============================================================
-- Este script elimina TODOS los datos de TODAS las tablas,
-- pero mantiene la estructura (tablas, columnas, índices, constraints).
--
-- Uso: Ejecutar en Supabase SQL Editor
--
-- ADVERTENCIA: Irreversible. Se pierden todos los datos.
-- ============================================================

-- Desactivar temporalmente los triggers para evitar overhead
SET session_replication_role = 'replica';

-- TRUNCATE en todas las tablas con CASCADE para resolver FKs
TRUNCATE TABLE
  -- Tablas de auditoría y logs
  audit_logs,

  -- Tablas del cotizador
  customer_configs,
  quote_invoices,
  quotes,

  -- Tablas de la tienda / inventario
  cart_items,
  order_items,
  payments,
  inventory_movements,
  orders,

  -- Tablas de la landing page
  landing_images,
  site_configs,

  -- Tablas de ofertas
  offers,

  -- Tablas de productos
  products,
  categories,
  suppliers,

  -- Tablas de usuarios
  customers,
  users,
  user_sessions,

  -- Tabla principal (última)
  shops
CASCADE;

-- Restaurar triggers
SET session_replication_role = 'origin';

-- Resetear las secuencias (si hubiera autoincrementales, aunque usamos UUIDs)
-- Por si acaso alguna tabla usa serial/bigserial en el futuro:
SELECT setval(pg_get_serial_sequence('quotes', 'id'), 1, false) WHERE EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'quotes_id_seq');

-- Confirmación
SELECT 'Base de datos limpiada correctamente. Todas las tablas están vacías.' AS status;
