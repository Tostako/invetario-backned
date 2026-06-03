  -- ============================================================
  -- TABLA: audit_logs (trazabilidad de cambios del admin)
  -- ============================================================
  -- Registra quién hizo qué, cuándo y qué cambió en la tienda.
  -- Se usa para site_configs, landing_images, service_catalog, etc.

  CREATE TABLE audit_logs (
    id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id     UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

    -- Acción
    action      VARCHAR(50)   NOT NULL,  -- UPDATE_SITE_CONFIG, UPLOAD_IMAGE, DELETE_IMAGE, etc.
    entity      VARCHAR(50)   NOT NULL,  -- SiteConfig, LandingImage, ServiceCatalog
    entity_id   VARCHAR(100),             -- ID del registro afectado (puede ser string)

    -- Snapshots
    old_value   TEXT,                     -- JSON string del objeto antes
    new_value   TEXT,                     -- JSON string del objeto después

    -- Quién
    user_id     UUID          NOT NULL REFERENCES users(id),

    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  -- ─── Índices ──────────────────────────────────────────────────────────────────
  CREATE INDEX idx_audit_logs_shop_id    ON audit_logs(shop_id);
  CREATE INDEX idx_audit_logs_entity     ON audit_logs(shop_id, entity);
  CREATE INDEX idx_audit_logs_user       ON audit_logs(shop_id, user_id);
  CREATE INDEX idx_audit_logs_created    ON audit_logs(created_at DESC);

  COMMENT ON TABLE audit_logs IS 'Registro inmutable de cambios del admin en la tienda.';
  COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción: UPDATE_SITE_CONFIG, UPLOAD_IMAGE, etc.';
  COMMENT ON COLUMN audit_logs.entity IS 'Tabla afectada: SiteConfig, LandingImage, etc.';
  COMMENT ON COLUMN audit_logs.old_value IS 'Snapshot JSON antes del cambio.';
  COMMENT ON COLUMN audit_logs.new_value IS 'Snapshot JSON después del cambio.';
