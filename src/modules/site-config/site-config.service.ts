// ─── Site Config Service ──────────────────────────────────────────────────────
// Traduce errores de BD y orquesta llamadas al repository.
// ─────────────────────────────────────────────────────────────────────────────

import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/AppError';
import { PaginationMeta } from '../../shared/types';
import {
  findAllSiteConfigs,
  findSiteConfigById,
  findPublicSiteConfigs,
  createSiteConfig,
  updateSiteConfig,
  softDeleteSiteConfig,
} from './site-config.repository';
import {
  CreateSiteConfigDto,
  UpdateSiteConfigDto,
  SiteConfigFilter,
  SiteConfig,
  PublicSiteConfig,
} from './site-config.types';
import { traducirErrorDB } from '../../shared/utils/dbErrors';

export const listSiteConfigsService = async (
  shopId: string,
  filter: SiteConfigFilter
): Promise<{ configs: SiteConfig[]; meta: PaginationMeta }> => {
  const { rows, total } = await findAllSiteConfigs(shopId, filter);
  return {
    configs: rows,
    meta: {
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const getSiteConfigService = async (
  shopId: string,
  configId: string
): Promise<SiteConfig> => {
  const config = await findSiteConfigById(shopId, configId);
  if (!config) throw new NotFoundError('Configuración');
  return config;
};

export const listPublicSiteConfigsService = async (
  shopId: string
): Promise<PublicSiteConfig[]> => {
  return findPublicSiteConfigs(shopId);
};

export const createSiteConfigService = async (
  shopId: string,
  dto: CreateSiteConfigDto,
  updatedBy?: string
): Promise<SiteConfig> => {
  try {
    return await createSiteConfig(shopId, dto, updatedBy);
  } catch (err) {
    throw traducirErrorDB(err, {
      CONFIG_DUPLICADA: (msg) => new ConflictError(`Ya existe una configuración con section+key en esta tienda`),
    });
  }
};

export const updateSiteConfigService = async (
  shopId: string,
  configId: string,
  dto: UpdateSiteConfigDto,
  updatedBy?: string
): Promise<SiteConfig> => {
  try {
    const updated = await updateSiteConfig(shopId, configId, dto, updatedBy);
    if (!updated) throw new NotFoundError('Configuración');
    return updated;
  } catch (err) {
    throw traducirErrorDB(err, {
      CONFIG_NOT_FOUND: () => new NotFoundError('Configuración'),
    });
  }
};

export const deleteSiteConfigService = async (
  shopId: string,
  configId: string
): Promise<void> => {
  try {
    await softDeleteSiteConfig(shopId, configId);
  } catch (err) {
    throw traducirErrorDB(err, {
      CONFIG_NOT_FOUND: () => new NotFoundError('Configuración'),
    });
  }
};
