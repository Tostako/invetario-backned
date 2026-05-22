"use strict";
// ─── Categories Repository ────────────────────────────────────────────────────
// Thin adapter: invoca stored procedures / funciones de la BD.
// Funciones definidas en: database/18_fn_categories.sql
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.countProductsByCategory = exports.softDeleteCategory = exports.actualizarImagenCategoria = exports.updateCategory = exports.createCategory = exports.findCategoryById = exports.buscarIdsCategoriaActivaPorNombre = exports.findAllCategories = void 0;
const database_1 = require("../../config/database");
const findAllCategories = async (shopId, filter) => {
    const offset = (filter.page - 1) * filter.limit;
    const result = await (0, database_1.query)(`SELECT * FROM fn_listar_categorias($1, $2, $3, $4)`, [shopId, filter.is_active ?? null, filter.limit, offset]);
    return {
        rows: result.rows,
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
    };
};
exports.findAllCategories = findAllCategories;
/** Nombres activos coincidentes (sin distinguir mayúsculas). Puede devolver varias filas si hay duplicados de nombre. */
const buscarIdsCategoriaActivaPorNombre = async (shopId, nombre) => {
    const result = await (0, database_1.query)(`SELECT id FROM categories
     WHERE shop_id = $1 AND is_active = TRUE
       AND lower(trim(name)) = lower(trim($2))
     ORDER BY created_at ASC`, [shopId, nombre]);
    return result.rows.map((r) => r.id);
};
exports.buscarIdsCategoriaActivaPorNombre = buscarIdsCategoriaActivaPorNombre;
const findCategoryById = async (shopId, categoryId) => {
    const result = await (0, database_1.query)(`SELECT * FROM fn_obtener_categoria($1, $2)`, [shopId, categoryId]);
    return result.rows[0] ?? null;
};
exports.findCategoryById = findCategoryById;
const createCategory = async (shopId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_crear_categoria($1, $2, $3, $4, $5)`, [shopId, dto.name, dto.description ?? null, dto.is_active, dto.parent_id ?? null]);
    return result.rows[0];
};
exports.createCategory = createCategory;
const updateCategory = async (shopId, categoryId, dto) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_categoria($1, $2, $3, $4, $5, $6)`, [
        shopId,
        categoryId,
        dto.name ?? null,
        dto.description ?? null,
        dto.is_active ?? null,
        dto.parent_id ?? null,
    ]);
    return result.rows[0] ?? null;
};
exports.updateCategory = updateCategory;
const actualizarImagenCategoria = async (shopId, categoryId, imageUrl) => {
    const result = await (0, database_1.query)(`SELECT * FROM sp_actualizar_categoria($1, $2, $3, $4, $5, $6, $7)`, [shopId, categoryId, null, null, null, null, imageUrl]);
    return result.rows[0] ?? null;
};
exports.actualizarImagenCategoria = actualizarImagenCategoria;
const softDeleteCategory = async (shopId, categoryId) => {
    await (0, database_1.query)(`SELECT sp_eliminar_categoria($1, $2)`, [shopId, categoryId]);
    return true;
};
exports.softDeleteCategory = softDeleteCategory;
const countProductsByCategory = async (shopId, categoryId) => {
    const result = await (0, database_1.query)(`SELECT fn_contar_productos_categoria($1, $2)`, [shopId, categoryId]);
    return parseInt(result.rows[0].fn_contar_productos_categoria ?? '0');
};
exports.countProductsByCategory = countProductsByCategory;
//# sourceMappingURL=category.repository.js.map