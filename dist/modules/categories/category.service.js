"use strict";
// ─── Categories Service ───────────────────────────────────────────────────────
// Database-Centric: validaciones de unicidad de nombre y bloqueo por
// productos activos ocurren en la BD (18_fn_categories.sql).
// El servicio traduce errores de BD y formatea la paginación.
// ─────────────────────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryService = exports.subirImagenCategoriaService = exports.updateCategoryService = exports.createCategoryService = exports.getCategoryService = exports.listCategoriesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const category_repository_1 = require("./category.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const supabase_1 = require("../../config/supabase");
const path_1 = __importDefault(require("path"));
const listCategoriesService = async (shopId, filter) => {
    const { rows, total } = await (0, category_repository_1.findAllCategories)(shopId, filter);
    return {
        categorias: rows,
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listCategoriesService = listCategoriesService;
const getCategoryService = async (shopId, categoryId) => {
    const categoria = await (0, category_repository_1.findCategoryById)(shopId, categoryId);
    if (!categoria)
        throw new AppError_1.NotFoundError('Categoría');
    return categoria;
};
exports.getCategoryService = getCategoryService;
const createCategoryService = async (shopId, dto) => {
    try {
        return await (0, category_repository_1.createCategory)(shopId, dto);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CATEGORIA_NOMBRE_DUPLICADO: () => new AppError_1.ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`),
        });
    }
};
exports.createCategoryService = createCategoryService;
const updateCategoryService = async (shopId, categoryId, dto) => {
    try {
        const actualizada = await (0, category_repository_1.updateCategory)(shopId, categoryId, dto);
        if (!actualizada)
            throw new AppError_1.NotFoundError('Categoría');
        return actualizada;
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CATEGORY_NOT_FOUND: () => new AppError_1.NotFoundError('Categoría'),
            CATEGORIA_NOMBRE_DUPLICADO: () => new AppError_1.ConflictError(`Ya existe una categoría con el nombre "${dto.name}" en esta tienda`),
        });
    }
};
exports.updateCategoryService = updateCategoryService;
const subirImagenCategoriaService = async (shopId, categoryId, file) => {
    const fileName = `${shopId}/${Date.now()}-${path_1.default.basename(file.originalname)}`;
    const { data, error } = await supabase_1.supabase.storage
        .from('category-images')
        .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
    });
    if (error) {
        throw new Error(`Supabase Storage error: ${error.message}`);
    }
    const { data: publicData } = supabase_1.supabase.storage
        .from('category-images')
        .getPublicUrl(data.path);
    const categoria = await (0, category_repository_1.actualizarImagenCategoria)(shopId, categoryId, publicData.publicUrl);
    if (!categoria)
        throw new AppError_1.NotFoundError('Categoría');
    return categoria;
};
exports.subirImagenCategoriaService = subirImagenCategoriaService;
const deleteCategoryService = async (shopId, categoryId) => {
    try {
        await (0, category_repository_1.softDeleteCategory)(shopId, categoryId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            CATEGORY_NOT_FOUND: () => new AppError_1.NotFoundError('Categoría'),
            CATEGORIA_CON_PRODUCTOS: (msg) => {
                const total = msg.split(':')[1];
                return new AppError_1.ValidationError(`No se puede eliminar la categoría: tiene ${total} producto(s) asociado(s)`);
            },
        });
    }
};
exports.deleteCategoryService = deleteCategoryService;
//# sourceMappingURL=category.service.js.map