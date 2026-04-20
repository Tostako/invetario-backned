-- ============================================================
-- VISTAS de encapsulación — Arquitectura Database-Centric
-- Las vistas son la "API pública" de las tablas.
-- Nadie debería hacer SELECT directo sobre las tablas base
-- (que podrían protegerse con GRANT/REVOKE en producción).
-- ============================================================

-- ─── Productos con información enriquecida ───────────────────────────────────

CREATE OR REPLACE VIEW v_productos AS
SELECT
  p.id,
  p.shop_id,
  p.category_id,
  p.supplier_id,
  p.sku,
  p.name,
  p.description,
  p.image_url,
  p.price,
  p.cost,
  p.stock,
  p.stock_min,
  p.stock_max,
  p.unit,
  p.is_active,
  p.created_at,
  p.updated_at,
  c.name AS category_name,
  s.name AS supplier_name,
  CASE
    WHEN p.stock = 0            THEN 'sin_stock'
    WHEN p.stock <= p.stock_min THEN 'stock_bajo'
    ELSE                             'ok'
  END AS estado_stock
FROM products p
LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
LEFT JOIN suppliers  s ON s.id = p.supplier_id  AND s.shop_id = p.shop_id;

COMMENT ON VIEW v_productos IS 'Productos con categoría, proveedor y estado de stock calculado.';

-- ─── Pedidos con información de cliente ──────────────────────────────────────

CREATE OR REPLACE VIEW v_pedidos AS
SELECT
  o.id,
  o.shop_id,
  o.customer_id,
  o.created_by,
  o.order_number,
  o.status,
  o.subtotal,
  o.discount,
  o.tax,
  o.total,
  o.notes,
  o.created_at,
  o.updated_at,
  c.name  AS customer_name,
  c.email AS customer_email,
  u.name  AS created_by_name
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id AND c.shop_id = o.shop_id
LEFT JOIN users     u ON u.id = o.created_by  AND u.shop_id = o.shop_id;

COMMENT ON VIEW v_pedidos IS 'Órdenes con nombre de cliente y usuario que creó la orden.';

-- ─── Ítems de pedido con info de producto ────────────────────────────────────

CREATE OR REPLACE VIEW v_items_pedido AS
SELECT
  oi.id,
  oi.shop_id,
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.unit_price,
  oi.discount,
  oi.subtotal,
  oi.created_at,
  p.name AS product_name,
  p.sku  AS product_sku
FROM order_items oi
JOIN products p ON p.id = oi.product_id;

COMMENT ON VIEW v_items_pedido IS 'Líneas de orden con nombre y SKU del producto al momento de la venta.';

-- ─── Carrito con información de producto ─────────────────────────────────────

CREATE OR REPLACE VIEW v_carrito AS
SELECT
  ci.id,
  ci.shop_id,
  ci.customer_id,
  ci.product_id,
  ci.quantity,
  ci.created_at,
  ci.updated_at,
  p.name   AS product_name,
  p.sku    AS product_sku,
  p.price  AS unit_price,
  p.stock  AS stock_available,
  (p.price * ci.quantity) AS subtotal,
  p.is_active AS product_active
FROM cart_items ci
JOIN products p ON p.id = ci.product_id AND p.shop_id = ci.shop_id;

COMMENT ON VIEW v_carrito IS 'Carrito de compras con precios actuales y disponibilidad.';

-- ─── Pagos con información de orden ──────────────────────────────────────────

CREATE OR REPLACE VIEW v_pagos AS
SELECT
  pay.id,
  pay.shop_id,
  pay.order_id,
  pay.mp_payment_id,
  pay.method,
  pay.status,
  pay.status_detail,
  pay.transaction_amount,
  pay.external_resource_url,
  pay.created_at,
  pay.updated_at,
  o.order_number,
  o.status AS order_status
FROM payments pay
JOIN orders o ON o.id = pay.order_id AND o.shop_id = pay.shop_id;

COMMENT ON VIEW v_pagos IS 'Pagos con número y estado de la orden asociada.';

-- ─── Tiendas — vista para administración ─────────────────────────────────────

CREATE OR REPLACE VIEW v_tiendas AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.email,
  s.phone,
  s.address,
  s.logo_url,
  s.currency,
  s.timezone,
  s.is_active,
  s.plan,
  s.created_at,
  s.updated_at,
  COUNT(DISTINCT u.id) AS total_usuarios,
  COUNT(DISTINCT p.id) AS total_productos,
  COUNT(DISTINCT o.id) AS total_pedidos
FROM shops s
LEFT JOIN users     u ON u.shop_id = s.id
LEFT JOIN products  p ON p.shop_id = s.id AND p.is_active = TRUE
LEFT JOIN orders    o ON o.shop_id = s.id
GROUP BY s.id, s.name, s.slug, s.email, s.phone, s.address,
         s.logo_url, s.currency, s.timezone, s.is_active, s.plan,
         s.created_at, s.updated_at;

COMMENT ON VIEW v_tiendas IS 'Vista de tiendas con conteos de usuarios, productos y pedidos para panel superadmin.';

-- ─── Resumen de inventario bajo stock ────────────────────────────────────────

CREATE OR REPLACE VIEW v_stock_bajo AS
SELECT
  p.id,
  p.shop_id,
  p.sku,
  p.name,
  p.stock,
  p.stock_min,
  p.stock_max,
  p.unit,
  c.name AS category_name,
  CASE WHEN p.stock = 0 THEN 'sin_stock' ELSE 'stock_bajo' END AS alerta
FROM products p
LEFT JOIN categories c ON c.id = p.category_id AND c.shop_id = p.shop_id
WHERE p.is_active = TRUE AND p.stock <= p.stock_min;

COMMENT ON VIEW v_stock_bajo IS 'Productos activos cuyo stock está en o por debajo del mínimo configurado.';
