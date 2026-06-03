"use strict";
// ─── Landing Image Repository ────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Sin SQL ad-hoc sobre las tablas base.
// Funciones definidas en: database/34_fn_landing_images.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteLandingImage = exports.updateLandingImage = exports.createLandingImage = exports.findPublicLandingImages = exports.findLandingImageById = exports.findAllLandingImages = void 0;
const database_1 = require("../../config/database");
const findAllLandingImages = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_landing_images($1, $2, $3, $4, $5)`, [
        shopId,
        filter.type ?? null,
        filter.is_active ?? null,
        filter.limit,
        offset,
    ]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllLandingImages = findAllLandingImages;
const findLandingImageById = async (shopId, imageId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_landing_image($1, $2)`, [shopId, imageId]);
    return result.rows[0] ?? null;
};
exports.findLandingImageById = findLandingImageById;
const findPublicLandingImages = async (shopId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_landing_images_publicas($1)`, [shopId]);
    return result.rows;
};
exports.findPublicLandingImages = findPublicLandingImages;
const createLandingImage = async (shopId, dto, uploadedBy) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_landing_image($1, $2, $3, $4, $5, $6, $7, $8)`, [
        shopId,
        dto.type,
        dto.url,
        dto.alt ?? null,
        dto.order,
        dto.active,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        uploadedBy ?? null,
    ]);
    return result.rows[0];
};
exports.createLandingImage = createLandingImage;
const updateLandingImage = async (shopId, imageId, dto, uploadedBy) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_landing_image($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
        shopId,
        imageId,
        dto.type ?? null,
        dto.url ?? null,
        dto.alt ?? null,
        dto.order ?? null,
        dto.active ?? null,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        uploadedBy ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.updateLandingImage = updateLandingImage;
const softDeleteLandingImage = async (shopId, imageId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_landing_image($1, $2)`, [shopId, imageId]);
    return true;
};
exports.softDeleteLandingImage = softDeleteLandingImage;
//# sourceMappingURL=landing-image.repository.js.map