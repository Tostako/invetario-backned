-- ============================================================
-- TABLA: inventory_movements (auditoría de movimientos de stock)
-- ============================================================
-- Registro inmutable de cada cambio de stock.
-- Nunca se actualiza ni se borra — es el historial de inventario.

CREATE TABLE inventory_movements (
  id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id      UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id   UUID          NOT NULL REFERENCES products(id),
  user_id      UUID          NOT NULL REFERENCES users(id),   -- quién lo hizo
  order_id     UUID          REFERENCES orders(id),           -- NULL si no es por venta

  type         VARCHAR(20)   NOT NULL
                             CHECK (type IN (
                               'purchase',    -- entrada por compra a proveedor
                               'sale',        -- salida por venta
                               'adjustment',  -- ajuste manual de inventario
                               'return',      -- devolución de cliente
                               'loss'         -- pérdida/merma
                             )),

  quantity     INTEGER       NOT NULL,   -- positivo = entrada, negativo = salida
  stock_before INTEGER       NOT NULL,   -- snapshot del stock antes del movimiento
  stock_after  INTEGER       NOT NULL,   -- snapshot del stock después

  notes        TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()

  -- Sin updated_at: esta tabla es append-only (auditoría inmutable)
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_movements_shop_id   ON inventory_movements(shop_id);
CREATE INDEX idx_movements_product   ON inventory_movements(shop_id, product_id);
CREATE INDEX idx_movements_created   ON inventory_movements(shop_id, created_at DESC);
CREATE INDEX idx_movements_type      ON inventory_movements(shop_id, type);

COMMENT ON TABLE inventory_movements IS 'Auditoría append-only de todos los cambios de stock. Nunca actualizar ni borrar.';
