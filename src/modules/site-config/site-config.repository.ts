// ─── Site Config Repository ──────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/31_fn_site_configs.sql
// ─────────────────────────────────────────────────────────────────────────────

import { query } from '../../config/database';
import { CreateSiteConfigDto, UpdateSiteConfigDto, SiteConfigFilter, SiteConfig, PublicSiteConfig } from './site-config.types';

interface FindAllResult {
  rows: SiteConfig[];
  total: number;
}

export const findAllSiteConfigs = async (
  shopId: string,
  filter: SiteConfigFilter
): Promise<FindAllResult> => {
  const offset = (filter.page - 1) * filter.limit;
  const result = await query<SiteConfig & { total_count: string }>(
    `SELECT * FROM fn_listar_site_configs($1, $2, $3, $4, $5)`,
    [
      shopId,
      filter.section ?? null,
      filter.is_active ?? null,
      filter.limit,
      offset,
    ]
  );
  return {
    rows: result.rows,
    total: result.rows.length > 0 ? parseInt(result.rows[0]!.total_count) : 0,
  };
};

export const findSiteConfigById = async (
  shopId: string,
  configId: string
): Promise<SiteConfig | null> => {
  const result = await query<SiteConfig>(
    `SELECT * FROM fn_obtener_site_config($1, $2)`,
    [shopId, configId]
  );
  return result.rows[0] ?? null;
};

export const findPublicSiteConfigs = async (
  shopId: string
): Promise<PublicSiteConfig[]> => {
  const result = await query<PublicSiteConfig>(
    `SELECT * FROM fn_listar_site_configs_publicas($1)`,
    [shopId]
  );
  return result.rows;
};

export const createSiteConfig = async (
  shopId: string,
  dto: CreateSiteConfigDto,
  updatedBy?: string
): Promise<SiteConfig> => {
  const result = await query<SiteConfig>(
    `SELECT * FROM sp_crear_site_config($1, $2, $3, $4, $5, $6, $7)`,
    [
      shopId,
      dto.section,
      dto.key,
      dto.value,
      dto.value_type,
      dto.active,
      updatedBy ?? null,
    ]
  );
  return result.rows[0]!;
};

export const updateSiteConfig = async (
  shopId: string,
  configId: string,
  dto: UpdateSiteConfigDto,
  updatedBy?: string
): Promise<SiteConfig | null> => {
  const result = await query<SiteConfig>(
    `SELECT * FROM sp_actualizar_site_config($1, $2, $3, $4, $5, $6)`,
    [
      shopId,
      configId,
      dto.value ?? null,
      dto.value_type ?? null,
      dto.active ?? null,
      updatedBy ?? null,
    ]
  );
  return result.rows[0] ?? null;
};

export const softDeleteSiteConfig = async (
  shopId: string,
  configId: string
): Promise<boolean> => {
  await query(`SELECT sp_eliminar_site_config($1, $2)`, [shopId, configId]);
  return true;
};
