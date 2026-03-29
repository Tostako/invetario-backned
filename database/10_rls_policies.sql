-- ============================================================
-- Row Level Security (RLS) — Supabase
-- ============================================================
-- Segunda capa de aislamiento multitenant a nivel de base de datos.
-- Aunque el backend ya filtra por shop_id, RLS evita cualquier
-- acceso accidental si alguien usa el cliente de Supabase directamente.

-- Habilitar RLS en todas las tablas con datos de tenant
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ─── Políticas ────────────────────────────────────────────────────────────────
-- El backend usa un rol de DB con privilegios completos (service role de Supabase),
-- por lo que las políticas aplican solo a conexiones externas.

-- Ejemplo de política para products (replicar en todas las tablas de tenant):
-- Permite SELECT solo si el shop_id coincide con la variable de sesión current_shop_id
-- que el backend debe setear en cada conexión.

-- CREATE POLICY products_tenant_isolation ON products
--   USING (shop_id = current_setting('app.current_shop_id')::uuid);

-- NOTA: Si el backend usa el service_role key de Supabase, RLS se bypasea
-- automáticamente. Para máxima seguridad, usar un rol con privilegios limitados
-- y setear current_setting antes de cada query.

-- Por ahora se deja el esquema listo. La activación de políticas se hace
-- cuando se configure el service_role vs anon_key en producción.
