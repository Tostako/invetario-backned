"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subirImagenCategoria = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.listCategories = void 0;
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/errors/AppError");
const category_types_1 = require("./category.types");
const category_service_1 = require("./category.service");
// Los controllers son delgados: parsear → llamar service → responder.
// No contienen lógica de negocio ni queries SQL.
// ─── HU12: Listar categorías ──────────────────────────────────────────────────
const listCategories = async (req, res, next) => {
    try {
        const filter = category_types_1.CategoryFilterSchema.parse(req.query);
        const { categorias, meta } = await (0, category_service_1.listCategoriesService)(req.user.shop_id, filter);
        (0, response_1.sendSuccess)(res, categorias, 200, meta);
    }
    catch (err) {
        next(err);
    }
};
exports.listCategories = listCategories;
// ─── HU12 (detalle): Obtener categoría por ID ─────────────────────────────────
const getCategory = async (req, res, next) => {
    try {
        const categoria = await (0, category_service_1.getCategoryService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, categoria);
    }
    catch (err) {
        next(err);
    }
};
exports.getCategory = getCategory;
// ─── HU11: Crear categoría ────────────────────────────────────────────────────
const createCategory = async (req, res, next) => {
    try {
        const dto = category_types_1.CreateCategorySchema.parse(req.body);
        const categoria = await (0, category_service_1.createCategoryService)(req.user.shop_id, dto);
        (0, response_1.sendCreated)(res, categoria);
    }
    catch (err) {
        next(err);
    }
};
exports.createCategory = createCategory;
// ─── HU13: Editar categoría ───────────────────────────────────────────────────
const updateCategory = async (req, res, next) => {
    try {
        const dto = category_types_1.UpdateCategorySchema.parse(req.body);
        let categoria = await (0, category_service_1.updateCategoryService)(req.user.shop_id, req.params['id'], dto);
        if (req.file) {
            categoria = await (0, category_service_1.subirImagenCategoriaService)(req.user.shop_id, req.params['id'], req.file);
        }
        (0, response_1.sendSuccess)(res, categoria);
    }
    catch (err) {
        next(err);
    }
};
exports.updateCategory = updateCategory;
// ─── HU14: Eliminar categoría ─────────────────────────────────────────────────
const deleteCategory = async (req, res, next) => {
    try {
        await (0, category_service_1.deleteCategoryService)(req.user.shop_id, req.params['id']);
        (0, response_1.sendSuccess)(res, { message: 'Categoría desactivada correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCategory = deleteCategory;
const subirImagenCategoria = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError_1.ValidationError('Debe enviar una imagen para la categoría');
        }
        const categoria = await (0, category_service_1.subirImagenCategoriaService)(req.user.shop_id, req.params['id'], req.file);
        (0, response_1.sendSuccess)(res, categoria);
    }
    catch (err) {
        next(err);
    }
};
exports.subirImagenCategoria = subirImagenCategoria;
//# sourceMappingURL=category.controller.js.map