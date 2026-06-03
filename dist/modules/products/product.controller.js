"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const response_1 = require("../../shared/utils/response");
const product_types_1 = require("./product.types");
const product_service_1 = require("./product.service");
const supabase_1 = require("../../config/supabase");
const path_1 = __importDefault(require("path"));
// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.
const listProducts = async (req, res, next) => {
    try {
        const filter = product_types_1.ProductFilterSchema.parse(req.query);
        const { products, meta } = await (0, product_service_1.listProductsService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, products, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listProducts = listProducts;
const getProduct = async (req, res, next) => {
    try {
        const product = await (0, product_service_1.getProductService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, product);
    }
    catch (err) {
        next(err);
    }
};
exports.getProduct = getProduct;
// Helper para subir a Supabase Storage
const uploadToSupabase = async (file, shopId) => {
    const fileName = `${shopId}/${Date.now()}-${path_1.default.basename(file.originalname)}`;
    const { data, error } = await supabase_1.supabase.storage
        .from('product-images')
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
    });
    if (error) {
        throw new Error(`Supabase Storage error: ${error.message}`);
    }
    const { data: { publicUrl } } = supabase_1.supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
    return publicUrl;
};
const createProduct = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image_url = await uploadToSupabase(req.file, req.user.shop_id);
        }
        const dto = product_types_1.CreateProductSchema.parse(data);
        const product = await (0, product_service_1.createProductService)(req.user.shop_id, dto);
        (0, response_1.sendCreated)(res, product);
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image_url = await uploadToSupabase(req.file, req.user.shop_id);
        }
        const dto = product_types_1.UpdateProductSchema.parse(data);
        const product = await (0, product_service_1.updateProductService)(req.user.shop_id, req.params['id'], dto);
        (0, response_1.sendSuccess)(res, product);
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        await (0, product_service_1.deleteProductService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Product deactivated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;
const adjustStock = async (req, res, next) => {
    try {
        // delta puede ser positivo (entrada) o negativo (salida)
        const { delta } = req.body;
        if (typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0) {
            res.status(422).json({
                success: false,
                message: 'delta must be a non-zero integer',
            });
            return;
        }
        const { notas } = req.body;
        const product = await (0, product_service_1.adjustStockService)(req.user.shop_id, req.params['id'], delta, req.user.id, 'adjustment', notas);
        (0, response_1.sendSuccess)(res, product);
    }
    catch (err) {
        next(err);
    }
};
exports.adjustStock = adjustStock;
//# sourceMappingURL=product.controller.js.map