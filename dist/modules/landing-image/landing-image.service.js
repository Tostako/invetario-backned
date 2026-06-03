"use strict";
// ─── Landing Image Service ────────────────────────────────────────────────────
// Traduce errores de BD y orquesta llamadas al repository.
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLandingImageService = exports.updateLandingImageService = exports.createLandingImageService = exports.listPublicLandingImagesService = exports.getLandingImageService = exports.listLandingImagesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const landing_image_repository_1 = require("./landing-image.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const listLandingImagesService = async (shopId, filter) => {
    const { rows, total } = await (0, landing_image_repository_1.findAllLandingImages)(shopId, filter);
    return {
        images: rows,
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listLandingImagesService = listLandingImagesService;
const getLandingImageService = async (shopId, imageId) => {
    const image = await (0, landing_image_repository_1.findLandingImageById)(shopId, imageId);
    if (!image)
        throw new AppError_1.NotFoundError('Imagen');
    return image;
};
exports.getLandingImageService = getLandingImageService;
const listPublicLandingImagesService = async (shopId) => {
    return (0, landing_image_repository_1.findPublicLandingImages)(shopId);
};
exports.listPublicLandingImagesService = listPublicLandingImagesService;
const createLandingImageService = async (shopId, dto, uploadedBy) => {
    return await (0, landing_image_repository_1.createLandingImage)(shopId, dto, uploadedBy);
};
exports.createLandingImageService = createLandingImageService;
const updateLandingImageService = async (shopId, imageId, dto, uploadedBy) => {
    try {
        const updated = await (0, landing_image_repository_1.updateLandingImage)(shopId, imageId, dto, uploadedBy);
        if (!updated)
            throw new AppError_1.NotFoundError('Imagen');
        return updated;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            IMAGE_NOT_FOUND: () => new AppError_1.NotFoundError('Imagen'),
        });
    }
};
exports.updateLandingImageService = updateLandingImageService;
const deleteLandingImageService = async (shopId, imageId) => {
    try {
        await (0, landing_image_repository_1.softDeleteLandingImage)(shopId, imageId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            IMAGE_NOT_FOUND: () => new AppError_1.NotFoundError('Imagen'),
        });
    }
};
exports.deleteLandingImageService = deleteLandingImageService;
//# sourceMappingURL=landing-image.service.js.map