"use strict";
// ─── Site Config Service ──────────────────────────────────────────────────────
// Traduce errores de BD y orquesta llamadas al repository.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSiteConfigService = exports.updateSiteConfigService = exports.createSiteConfigService = exports.listPublicSiteConfigsService = exports.getSiteConfigService = exports.listSiteConfigsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const site_config_repository_1 = require("./site-config.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const listSiteConfigsService = async (shopId, filter) => {
    const { rows, total } = await (0, site_config_repository_1.findAllSiteConfigs)(shopId, filter);
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
exports.listSiteConfigsService = listSiteConfigsService;
const getSiteConfigService = async (shopId, configId) => {
    const config = await (0, site_config_repository_1.findSiteConfigById)(shopId, configId);
    if (!config)
        throw new AppError_1.NotFoundError('Configuración');
    return config;
};
exports.getSiteConfigService = getSiteConfigService;
const listPublicSiteConfigsService = async (shopId) => {
    return (0, site_config_repository_1.findPublicSiteConfigs)(shopId);
};
exports.listPublicSiteConfigsService = listPublicSiteConfigsService;
const createSiteConfigService = async (shopId, dto, updatedBy) => {
    try {
        return await (0, site_config_repository_1.createSiteConfig)(shopId, dto, updatedBy);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CONFIG_DUPLICADA: (msg) => new AppError_1.ConflictError(`Ya existe una configuración con section+key en esta tienda`),
        });
    }
};
exports.createSiteConfigService = createSiteConfigService;
const updateSiteConfigService = async (shopId, configId, dto, updatedBy) => {
    try {
        const updated = await (0, site_config_repository_1.updateSiteConfig)(shopId, configId, dto, updatedBy);
        if (!updated)
            throw new AppError_1.NotFoundError('Configuración');
        return updated;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CONFIG_NOT_FOUND: () => new AppError_1.NotFoundError('Configuración'),
        });
    }
};
exports.updateSiteConfigService = updateSiteConfigService;
const deleteSiteConfigService = async (shopId, configId) => {
    try {
        await (0, site_config_repository_1.softDeleteSiteConfig)(shopId, configId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CONFIG_NOT_FOUND: () => new AppError_1.NotFoundError('Configuración'),
        });
    }
};
exports.deleteSiteConfigService = deleteSiteConfigService;
//# sourceMappingURL=site-config.service.js.map