-- ============================================================
-- Extensiones necesarias (ejecutar una sola vez en Supabase)
-- ============================================================

-- uuid_generate_v4() para PKs automáticos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- citext: comparaciones de texto case-insensitive (emails, slugs)
CREATE EXTENSION IF NOT EXISTS "citext";
