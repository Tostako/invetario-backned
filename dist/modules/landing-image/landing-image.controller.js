"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicLandingImages = exports.deleteLandingImage = exports.updateLandingImage = exports.createLandingImage = exports.getLandingImage = exports.listLandingImages = void 0;
const response_1 = require("../../shared/utils/response");
const landing_image_types_1 = require("./landing-image.types");
const landing_image_service_1 = require("./landing-image.service");
// ─── Admin Controllers ───────────────────────────────────────────────────────
const listLandingImages = async (req, res, next) => {
    try {
        const filter = landing_image_types_1.LandingImageFilterSchema.parse(req.query);
        const { images, meta } = await (0, landing_image_service_1.listLandingImagesService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, images, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listLandingImages = listLandingImages;
const getLandingImage = async (req, res, next) => {
    try {
        const image = await (0, landing_image_service_1.getLandingImageService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, image);
    }
    catch (err) {
        next(err);
    }
};
exports.getLandingImage = getLandingImage;
const createLandingImage = async (req, res, next) => {
    try {
        const dto = landing_image_types_1.CreateLandingImageSchema.parse(req.body);
        const image = await (0, landing_image_service_1.createLandingImageService)(req.user.shop_id, dto, req.user.id);
        (0, response_1.sendCreated)(res, image);
    }
    catch (err) {
        next(err);
    }
};
exports.createLandingImage = createLandingImage;
const updateLandingImage = async (req, res, next) => {
    try {
        const dto = landing_image_types_1.UpdateLandingImageSchema.parse(req.body);
        const image = await (0, landing_image_service_1.updateLandingImageService)(req.user.shop_id, req.params['id'], dto, req.user.id);
        (0, response_1.sendSuccess)(res, image);
    }
    catch (err) {
        next(err);
    }
};
exports.updateLandingImage = updateLandingImage;
const deleteLandingImage = async (req, res, next) => {
    try {
        await (0, landing_image_service_1.deleteLandingImageService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Image deactivated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteLandingImage = deleteLandingImage;
// ─── Public Controller ────────────────────────────────────────────────────────
const listPublicLandingImages = async (req, res, next) => {
    try {
        const images = await (0, landing_image_service_1.listPublicLandingImagesService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, images);
    }
    catch (err) {
        next(err);
    }
};
exports.listPublicLandingImages = listPublicLandingImages;
//# sourceMappingURL=landing-image.controller.js.map