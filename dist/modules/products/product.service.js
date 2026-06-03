"use strict";
// ─── Products Service ─────────────────────────────────────────────────────────
// Con Database-Centric Architecture, la lógica de negocio (SKU único, stock_max,
// stock negativo) vive en los stored procedures de la BD.
// El servicio se encarga de:
//   1. Traducir errores de BD a AppErrors con mensajes claros
//   2. Formatear la respuesta de paginación
//   3. Orquestar llamadas cuando el controller lo necesita
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStockService = exports.deleteProductService = exports.updateProductService = exports.createProductService = exports.getProductService = exports.listProductsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const product_repository_1 = require("./product.repository");
const dbErrors_1 = require("../../shared/utils/dbErrors");
const calcularEstadoStock = (stock, stockMin) => {
    if (stock <= 0)
        return 'sin_stock';
    if (stock <= stockMin)
        return 'bajo';
    return 'ok';
};
const conEstadoStock = (p) => ({
    ...p,
    estado_stock: calcularEstadoStock(p.stock, p.stock_min),
});
const listProductsService = async (shopId, filter) => {
    const { rows, total } = await (0, product_repository_1.findAllProducts)(shopId, filter);
    return {
        products: rows.map(conEstadoStock),
        meta: {
            total,
            page: filter.page,
            limit: filter.limit,
            totalPages: Math.ceil(total / filter.limit),
        },
    };
};
exports.listProductsService = listProductsService;
const getProductService = async (shopId, productId) => {
    const product = await (0, product_repository_1.findProductById)(shopId, productId);
    if (!product)
        throw new AppError_1.NotFoundError('Producto');
    return conEstadoStock(product);
};
exports.getProductService = getProductService;
const createProductService = async (shopId, dto) => {
    try {
        return conEstadoStock(await (0, product_repository_1.createProduct)(shopId, dto));
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            SKU_DUPLICADO: () => new AppError_1.ConflictError(`SKU "${dto.sku.toUpperCase()}" ya existe en esta tienda`),
            STOCK_MAX_INVALIDO: () => new AppError_1.ValidationError('stock_max debe ser mayor que stock_min'),
        });
    }
};
exports.createProductService = createProductService;
const updateProductService = async (shopId, productId, dto) => {
    try {
        const updated = await (0, product_repository_1.updateProduct)(shopId, productId, dto);
        if (!updated)
            throw new AppError_1.NotFoundError('Producto');
        return conEstadoStock(updated);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PRODUCT_NOT_FOUND: () => new AppError_1.NotFoundError('Producto'),
            SKU_DUPLICADO: () => new AppError_1.ConflictError(`SKU "${dto.sku?.toUpperCase()}" ya existe en esta tienda`),
            STOCK_MAX_INVALIDO: () => new AppError_1.ValidationError('stock_max debe ser mayor que stock_min'),
        });
    }
};
exports.updateProductService = updateProductService;
const deleteProductService = async (shopId, productId) => {
    try {
        await (0, product_repository_1.softDeleteProduct)(shopId, productId);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PRODUCT_NOT_FOUND: () => new AppError_1.NotFoundError('Producto'),
        });
    }
};
exports.deleteProductService = deleteProductService;
const adjustStockService = async (shopId, productId, delta, userId, tipo, notas) => {
    try {
        const updated = await (0, product_repository_1.adjustStock)(shopId, productId, delta, userId, tipo, undefined, notas);
        if (!updated)
            throw new AppError_1.NotFoundError('Producto');
        return conEstadoStock(updated);
    }
    catch (err) {
        throw (0, dbErrors_1.traducirErrorDB)(err, {
            PRODUCT_NOT_FOUND: () => new AppError_1.NotFoundError('Producto'),
            STOCK_NEGATIVO: () => new AppError_1.ValidationError('El ajuste resultaría en stock negativo'),
        });
    }
};
exports.adjustStockService = adjustStockService;
//# sourceMappingURL=product.service.js.map