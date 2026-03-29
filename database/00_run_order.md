# Orden de ejecución en Supabase SQL Editor

Ejecutar en este orden (las FK dependen de las tablas anteriores):

1. `01_extensions.sql`
2. `02_shops.sql`
3. `03_users.sql`
4. `04_categories.sql`
5. `05_suppliers.sql`
6. `06_products.sql`
7. `07_customers.sql`
8. `08_orders.sql`
9. `09_inventory_movements.sql`
10. `10_rls_policies.sql` (revisar antes de activar en producción)
