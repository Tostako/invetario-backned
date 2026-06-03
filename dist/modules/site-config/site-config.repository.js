"use strict";
// ─── Site Config Repository ──────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/31_fn_site_configs.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteSiteConfig = exports.updateSiteConfig = exports.createSiteConfig = exports.findPublicSiteConfigs = exports.findSiteConfigById = exports.findAllSiteConfigs = void 0;
const database_1 = require("../../config/database");
const findAllSiteConfigs = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_site_configs($1, $2, $3, $4, $5)`, [
        shopId,
        filter.section ?? null,
        filter.is_active ?? null,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllSiteConfigs = findAllSiteConfigs;
const findSiteConfigById = async (shopId, configId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_site_config($1, $2)`, [shopId, configId]);
    return result.rows[0] ?? null;
};
exports.findSiteConfigById = findSiteConfigById;
const findPublicSiteConfigs = async (shopId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_site_configs_publicas($1)`, [shopId]);
    return result.rows;
};
exports.findPublicSiteConfigs = findPublicSiteConfigs;
const createSiteConfig = async (shopId, dto, updatedBy) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_site_config($1, $2, $3, $4, $5, $6, $7)`, [
        shopId,
        dto.section,
        dto.key,
        dto.value,
        dto.value_type,
        dto.active,
        updatedBy ?? null,
    ]);
    return result.rows[0];
};
exports.createSiteConfig = createSiteConfig;
const updateSiteConfig = async (shopId, configId, dto, updatedBy) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_site_config($1, $2, $3, $4, $5, $6)`, [
        shopId,
        configId,
        dto.value ?? null,
        dto.value_type ?? null,
        dto.active ?? null,
        updatedBy ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.updateSiteConfig = updateSiteConfig;
const softDeleteSiteConfig = async (shopId, configId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_site_config($1, $2)`, [shopId, configId]);
    return true;
};
exports.softDeleteSiteConfig = softDeleteSiteConfig;
//# sourceMappingURL=site-config.repository.js.map