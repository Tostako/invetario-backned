"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicLandingImages = exports.listPublicSiteConfigs = exports.listPublicOffers = exports.listPublicCategories = exports.getPublicProduct = exports.listPublicProducts = void 0;
const response_1 = require("../../shared/utils/response");
const product_types_1 = require("../products/product.types");
const category_types_1 = require("../categories/category.types");
const product_service_1 = require("../products/product.service");
const category_service_1 = require("../categories/category.service");
const category_repository_1 = require("../categories/category.repository");
const offer_service_1 = require("../offers/offer.service");
const site_config_service_1 = require("../site-config/site-config.service");
const landing_image_service_1 = require("../landing-image/landing-image.service");
const uuidV4_1 = require("../../shared/utils/uuidV4");
const AppError_1 = require("../../shared/errors/AppError");
// ─── Productos Públicos ───────────────────────────────────────────────────────
const listPublicProducts = async (req, res, next) => {
    try {
        const parsed = product_types_1.PublicProductFilterSchema.parse(req.query);
        let category_id = parsed.category_id;
        if (category_id) {
            if (!(0, uuidV4_1.esUuidV4)(category_id)) {
                const ids = await (0, category_repository_1.buscarIdsCategoriaActivaPorNombre)(req.user.shop_id, category_id);
                if (ids.length === 0) {
                    throw new AppError_1.ValidationError(`No hay categoría activa con el nombre "${category_id}". Usa el UUID de GET /api/v1/public/categories?shop_slug=... o el nombre exacto.`);
                }
                if (ids.length > 1) {
                    throw new AppError_1.ValidationError(`Hay varias categorías activas con el nombre "${category_id}". Indica category_id como UUID (lista en GET /api/v1/public/categories).`);
                }
                category_id = ids[0];
            }
        }
        const publicFilter = { ...parsed, category_id, is_active: true };
        const { products, meta } = await (0, product_service_1.listProductsService)(req.user.shop_id, publicFilter);
        (0, response_1.sendSuccess)(res, products, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listPublicProducts = listPublicProducts;
const getPublicProduct = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.getProductService)(req.user.shop_id, req.params['id']);
        // Ocultar campos sensibles/internos del producto
        const { cost, stock, stock_min, stock_max, ...publicProduct } = product;
        (0, response_1.sendSuccess)(res, publicProduct);
    }
    catch (err) {
        next(err);
    }
};
exports.getPublicProduct = getPublicProduct;
// ─── Categorías Públicas ──────────────────────────────────────────────────────
const listPublicCategories = async (req, res, next) => {
    try {
        const filter = category_types_1.CategoryFilterSchema.parse(req.query);
        // Forzar is_active=true en el catálogo público
        const publicFilter = { ...filter, is_active: true };
        const { categorias, meta } = await (0, category_service_1.listCategoriesService)(req.user.shop_id, publicFilter);
        (0, response_1.sendSuccess)(res, categorias, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listPublicCategories = listPublicCategories;
// ─── Ofertas Públicas ─────────────────────────────────────────────────────────
const listPublicOffers = async (req, res, next) => {
    try {
        const offers = await (0, offer_service_1.listPublicOffersService)(req.user.shop_id);
        (0, response_1.sendSuccess)(res, offers);
    }
    catch (err) {
        next(err);
    }
};
exports.listPublicOffers = listPublicOffers;
// ─── Site Config Público ─────────────────────────────────────────────────────
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
// ─── Landing Images Público ──────────────────────────────────────────────────
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
//# sourceMappingURL=public.controller.js.map