"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicSiteConfigs = exports.deleteSiteConfig = exports.updateSiteConfig = exports.createSiteConfig = exports.getSiteConfig = exports.listSiteConfigs = void 0;
const response_1 = require("../../shared/utils/response");
const site_config_types_1 = require("./site-config.types");
const site_config_service_1 = require("./site-config.service");
// ─── Admin Controllers ───────────────────────────────────────────────────────
const listSiteConfigs = async (req, res, next) => {
    try {
        const filter = site_config_types_1.SiteConfigFilterSchema.parse(req.query);
        const { configs, meta } = await (0, site_config_service_1.listSiteConfigsService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, configs, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listSiteConfigs = listSiteConfigs;
const getSiteConfig = async (req, res, next) => {
    try {
        const config = await (0, site_config_service_1.getSiteConfigService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, config);
    }
    catch (err) {
        next(err);
    }
};
exports.getSiteConfig = getSiteConfig;
const createSiteConfig = async (req, res, next) => {
    try {
        const dto = site_config_types_1.CreateSiteConfigSchema.parse(req.body);
        const config = await (0, site_config_service_1.createSiteConfigService)(req.user.shop_id, dto, req.user.id);
        (0, response_1.sendCreated)(res, config);
    }
    catch (err) {
        next(err);
    }
};
exports.createSiteConfig = createSiteConfig;
const updateSiteConfig = async (req, res, next) => {
    try {
        const dto = site_config_types_1.UpdateSiteConfigSchema.parse(req.body);
        const config = await (0, site_config_service_1.updateSiteConfigService)(req.user.shop_id, req.params['id'], dto, req.user.id);
        (0, response_1.sendSuccess)(res, config);
    }
    catch (err) {
        next(err);
    }
};
exports.updateSiteConfig = updateSiteConfig;
const deleteSiteConfig = async (req, res, next) => {
    try {
        await (0, site_config_service_1.deleteSiteConfigService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Config deactivated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteSiteConfig = deleteSiteConfig;
// ─── Public Controller ───────────────────────────────────────────────────────
const listPublicSiteConfigs = async (req, res, next) => {
    try {
        const configs = await (0, site_config_service_1.listPublicSiteConfigsService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, configs);
    }
    catch (err) {
        next(err);
    }
};
exports.listPublicSiteConfigs = listPublicSiteConfigs;
//# sourceMappingURL=site-config.controller.js.map